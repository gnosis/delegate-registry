import R from "ramda"
import { computeVoteWeights } from "./data-transformers/compute-vote-weights"
import { getDelegationRatioMap } from "./data"
import { fetchVoteWeights } from "./services/snapshot"
import { convertDelegatedVoteWeightByAccount } from "./data-transformers/scale-and-remove-empty"
import * as db from "./services/storage/db"

export const createDelegationSnapshot = async (
  space: string,
  blocknumber?: number,
) => {
  const startTime = Date.now()
  if (blocknumber == null) {
    console.log("Updating the latest snapshot for the following space:", space)
  } else {
    console.log(
      "Creating a snapshot for the following space:",
      space,
      "at blocknumber:",
      blocknumber,
    )
  }

  console.log(`[${space}] 1. Fetch and merge all delegations across all chains`)

  const delegations = await getDelegationRatioMap(space, blocknumber)
  if (delegations == null) {
    console.log(`[${space}] Done: no delegations found.`)
    if (blocknumber != null) {
      await db.addSnapshotToTheExcisingSnapshotTable(space, blocknumber)
    }
    return
  }
  const getDelegationRatioMapExecutionDoneTime = Date.now()
  console.log(
    `getDelegationRatioMapExecutionDoneTime execution time: ${
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
    `[${space}] 2. Getting vote weights for ${accountsRequiringVoteWeight.length} unique delegating addresses.`,
  )

  const computeAccountsRequiringVoteWeightExecutionDoneTime = Date.now()
  console.log(
    `computeAccountsRequiringVoteWeightExecutionDoneTime execution time: ${
      (computeAccountsRequiringVoteWeightExecutionDoneTime -
        getDelegationRatioMapExecutionDoneTime) /
      1000
    } seconds`,
  )

  const voteWeights = await fetchVoteWeights(
    space,
    accountsRequiringVoteWeight,
    blocknumber,
  )

  const fetchVoteWeightsExecutionDoneTime = Date.now()
  console.log(
    `fetchVoteWeightsExecutionDoneTime execution time: ${
      (fetchVoteWeightsExecutionDoneTime -
        computeAccountsRequiringVoteWeightExecutionDoneTime) /
      1000
    } seconds`,
  )

  if (R.keys(voteWeights)?.length === 0) {
    console.log(`[${space}] Done: no vote weights found.`)
    if (blocknumber != null) {
      await db.addSnapshotToTheExcisingSnapshotTable(space, blocknumber)
    }
    return
  }

  console.log(
    `[${space}] 3. Computing vote weights for ${
      R.keys(voteWeights).length
    } delegating addresses with non-zero vote weight.`,
  )
  const [delegatedVoteWeight, delegatedVoteWeightByAccount] =
    computeVoteWeights(delegations, voteWeights)

  const computeVoteWeightsExecutionDoneTime = Date.now()
  console.log(
    `computeVoteWeights execution time: ${
      (computeVoteWeightsExecutionDoneTime -
        fetchVoteWeightsExecutionDoneTime) /
      1000
    } seconds`,
  )

  console.log(
    `[${space}] 4. Storing delegated vote weight for ${
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
    `convertDelegatedVoteWeightByAccount execution time: ${
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
        context: space,
        main_chain_block_number: blocknumber ?? null,
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
    `createDbWriteObjects execution time: ${
      (createDbWriteObjectsExecutionDoneTime -
        convertDelegatedVoteWeightByAccountExecutionDoneTime) /
      1000
    } seconds`,
  )

  // console.log("snapshot", snapshot)

  if (snapshot.length === 0) {
    if (blocknumber != null) {
      await db.addSnapshotToTheExcisingSnapshotTable(space, blocknumber) // even if the snapshot is empety we store it to avoid re-computing it
    }
    return
  }

  if (blocknumber != null) {
    // we delete the latest snapshot for this space before we write the new one
    await db.deleteLatestSnapshot(space) // should only have one latest snapshot (last snapshot has blocknumber = null)
  }

  const res = await db.storeSnapshot(snapshot)

  const dbStoreSnapshotExecutionDoneTime = Date.now()
  console.log(
    `dbStoreSnapshot execution time: ${
      (dbStoreSnapshotExecutionDoneTime -
        createDbWriteObjectsExecutionDoneTime) /
      1000
    } seconds`,
  )

  return res
}
