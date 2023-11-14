import R from "ramda"
import { computeVoteWeights } from "./data-transformers/compute-vote-weights"
import { getDelegationRatioMap } from "./data"
import {
  DelegateRegistryStrategyParams,
  SnapshotStrategy,
  fetchSnapshotSpaceSettings,
  fetchVoteWeights,
} from "./services/snapshot"
import { convertDelegatedVoteWeightByAccount } from "./data-transformers/scale-and-remove-empty"
import * as db from "./services/storage/db"

type CreateDelegationSnapshotParams = {
  spaceName: string
  mainChainBlocknumber?: number
  delegateRegistryParamsIn?: DelegateRegistryStrategyParams
  isTestSpace?: boolean
}

export const createDelegationSnapshot = async ({
  spaceName,
  mainChainBlocknumber,
  delegateRegistryParamsIn,
  isTestSpace,
}: CreateDelegationSnapshotParams) => {
  const startTime = Date.now()
  const isUpdateOfLatest = mainChainBlocknumber == null
  const useSnapshotTestHub = isTestSpace ?? false

  console.log("startTime:", startTime)

  if (
    (!isUpdateOfLatest && delegateRegistryParamsIn == null) ||
    (isUpdateOfLatest && delegateRegistryParamsIn != null)
  ) {
    throw new Error(
      "If creating a snapshot for a specific blocknumber, snapshotStrategies must be provided. If creating the latest snapshot, snapshotStrategies must NOT be provided.",
    )
  }

  const spaceSettings =
    delegateRegistryParamsIn ??
    (await fetchSnapshotSpaceSettings(spaceName, useSnapshotTestHub))
  console.log(`[${spaceName}] spaceSettings:`, spaceSettings)

  if (spaceSettings == null) {
    throw new Error(
      "No delegate registry strategy v2 found for space: " + spaceName,
    )
  }

  if (isUpdateOfLatest) {
    console.log(`[${spaceName}] Updating the latest snapshot`)
  } else {
    console.log(
      `[${spaceName}] Creating a snapshot for the following space at blocknumber: `,
      mainChainBlocknumber,
    )
  }

  console.log(
    `[${spaceName}] 1. Fetch and merge all delegations across all chains`,
  )

  const delegations = await getDelegationRatioMap(
    spaceName,
    spaceSettings,
    mainChainBlocknumber,
  )
  console.log(
    `[${spaceName}] Total number of delegations: ${
      Object.keys(delegations).length
    })`,
  )

  if (delegations == null) {
    console.log(`[${spaceName}] Done: no delegations found.`)
    if (!isUpdateOfLatest) {
      await db.addSnapshotToTheExcisingSnapshotTable(
        mainChainBlocknumber,
        spaceName,
        spaceSettings,
      )
    }
    return
  }
  const getDelegationRatioMapExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] getDelegationRatioMapExecutionDoneTime execution time: ${
      (getDelegationRatioMapExecutionDoneTime - startTime) / 1000
    } seconds`,
  )

  const accountsRequiringVoteWeight = R.uniq(
    R.flatten(
      Object.entries(delegations).map(([delegate, member]) => [
        ...Object.keys(member),
        delegate,
      ]),
    ),
  )
  console.log(
    `[${spaceName}] 2. Getting vote weights for ${accountsRequiringVoteWeight.length} unique delegating addresses.`,
  )

  const computeAccountsRequiringVoteWeightExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}]computeAccountsRequiringVoteWeightExecutionDoneTime execution time: ${
      (computeAccountsRequiringVoteWeightExecutionDoneTime -
        getDelegationRatioMapExecutionDoneTime) /
      1000
    } seconds`,
  )

  const voteWeights = await fetchVoteWeights(
    spaceName,
    accountsRequiringVoteWeight,
    mainChainBlocknumber,
    spaceSettings.strategies,
  )

  const fetchVoteWeightsExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] fetchVoteWeightsExecutionDoneTime execution time: ${
      (fetchVoteWeightsExecutionDoneTime -
        computeAccountsRequiringVoteWeightExecutionDoneTime) /
      1000
    } seconds`,
  )

  if (R.keys(voteWeights)?.length === 0) {
    console.log(`[${spaceName}] Done: no vote weights found.`)
    if (mainChainBlocknumber != null) {
      await db.addSnapshotToTheExcisingSnapshotTable(
        mainChainBlocknumber,
        spaceName,
        spaceSettings,
      )
    }
    return
  }

  console.log(
    `[${spaceName}] 3. Computing vote weights for ${
      R.keys(voteWeights).length
    } delegating addresses with non-zero vote weight.`,
  )
  const [delegatedVoteWeight, delegatedVoteWeightByAccount] =
    computeVoteWeights(delegations, voteWeights)

  const computeVoteWeightsExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] computeVoteWeights execution time: ${
      (computeVoteWeightsExecutionDoneTime -
        fetchVoteWeightsExecutionDoneTime) /
      1000
    } seconds`,
  )

  console.log(
    `[${spaceName}] 4. Storing delegated vote weight for ${
      Object.keys(delegatedVoteWeightByAccount).length
    } delegators.`,
  )

  // const delegatedVoteWeightScaled =
  //   convertDelegatedVoteWeight(delegatedVoteWeight)

  // console.log("delegatedVoteWeightByAccount:", delegatedVoteWeightByAccount)

  const delegatedVoteWeightByAccountScaled =
    convertDelegatedVoteWeightByAccount(delegatedVoteWeightByAccount)

  const convertDelegatedVoteWeightByAccountExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] convertDelegatedVoteWeightByAccount execution time: ${
      (convertDelegatedVoteWeightByAccountExecutionDoneTime -
        computeVoteWeightsExecutionDoneTime) /
      1000
    } seconds`,
  )

  // console.log(
  //   "delegatedVoteWeightByAccountScaled",
  //   delegatedVoteWeightByAccountScaled,
  // )

  // TODO: optimize this by doing it in one of the previous steps (loops)
  const snapshot: db.DelegationSnapshot[] = Object.entries(
    delegatedVoteWeightByAccountScaled,
  ).reduce((acc, [delegate, delegators]) => {
    Object.entries(delegators).forEach(([delegator, voteWeight]) => {
      const to_address_own_amount =
        voteWeights[delegate] == null
          ? "0"
          : voteWeights[delegate].toFixed(18).replace(".", "")
      acc.push({
        context: spaceName,
        main_chain_block_number: mainChainBlocknumber ?? null,
        from_address: delegator,
        to_address: delegate,
        delegated_amount: voteWeight,
        to_address_own_amount,
      })
    })
    return acc
  }, [] as db.DelegationSnapshot[])

  const createDbWriteObjectsExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] createDbWriteObjects execution time: ${
      (createDbWriteObjectsExecutionDoneTime -
        convertDelegatedVoteWeightByAccountExecutionDoneTime) /
      1000
    } seconds`,
  )

  if (snapshot.length === 0) {
    if (mainChainBlocknumber != null && spaceSettings.strategies != null) {
      await db.addSnapshotToTheExcisingSnapshotTable(
        mainChainBlocknumber,
        spaceName,
        spaceSettings,
      ) // even if the snapshot is empty we store it to avoid re-computing it
    }
    return
  }

  if (mainChainBlocknumber != null) {
    // we delete the latest snapshot for this space before we write the new one
    await db.deleteLatestSnapshot(spaceName) // should only have one latest snapshot (last snapshot has blocknumber = null)
  }

  const res = await db.storeSnapshot(snapshot, spaceSettings)

  const dbStoreSnapshotExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] dbStoreSnapshot execution time: ${
      (dbStoreSnapshotExecutionDoneTime -
        createDbWriteObjectsExecutionDoneTime) /
      1000
    } seconds`,
  )

  return res
}
