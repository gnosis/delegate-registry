import * as theGraph from "./services/the-graph"
import {
  mergeDelegationOptouts as mergeDelegatorOptouts,
  mergeDelegationSets,
} from "./data-transformers/merge-delegation-sets"
import { removeOptouts } from "./data-transformers/remove-optouts"
import { generateDelegationRatioMap } from "./data-transformers/generate-delegation-ratio-map"
import R, { times } from "ramda"
import { DelegationSet, Optout } from "../types"
import {
  DelegateRegistryStrategyParams,
  fetchSnapshotSpaceSettings,
  getV1DelegatesBySpace,
} from "./services/snapshot"
import { ethers } from "ethers"

/**
 * This will fetch all unique context ids from all subgraphs.
 *
 * @remarks
 * The context ids are assumed to reference snapshot spaces. However this list will
 * also contain context ids that are not snapshot spaces.
 *
 * @returns All unique snapshot spaces (context ids) from all chains
 *
 */
export const getSnapshotSpaces = async () => {
  const responds = await theGraph.fetchContextIdsFromAllChains()
  return R.uniq(responds.map((_) => _.id))
}
/**
 * This will:
 * 1. Fetch all delegations to a given snapshot space (context id) from all subgraphs.
 * 2. Merge the delegationSets and optouts from all chains (in case of conflicts the latest will be used).
 * 3. Remove optout delegators (and recompute dominators, across delegationSets).
 * 4. Creates the delegation ratio map (delegate -> delegator -> ratio).
 *
 * @param spaceName - The snapshot space (context id) to fetch delegations for
 * @returns Map of (delegate -> delegator -> ratio)
 */
export const getDelegationRatioMap = async (
  spaceName: string,
  snapshotSettingsIn: DelegateRegistryStrategyParams,
  blocknumber?: number,
) => {
  const timestamp = await getTimestampForBlocknumber(
    snapshotSettingsIn.mainChainId,
    spaceName,
    blocknumber,
  )
  const startTime = Date.now()

  // 1. fetch context from all chains
  const allV2DelegationSets: DelegationSet[] =
    await theGraph.fetchDelegationSetsFromAllChains(spaceName, timestamp)

  const v1Networks = snapshotSettingsIn.delegationV1VChainIds?.map((num: any) =>
    Number(num),
  )
  console.log(`[${spaceName}] v1Networks: ${v1Networks}`)

  const allV1Delegations: DelegationSet[] =
    v1Networks == null
      ? []
      : await getV1Delegations(spaceName, v1Networks, timestamp)
  console.log(`[${spaceName}] allV1Delegations: ${allV1Delegations.length}`)
  console.log(`[${spaceName}] allV2Delegation: ${allV2DelegationSets.length}`)
  const fetchDelegationSetsFromAllChainsExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] fetchDelegationSetsFromAllChains execution time: ${
      (fetchDelegationSetsFromAllChainsExecutionDoneTime - startTime) / 1000
    } seconds`,
  )

  // const delegationSetsForEachChain: DelegationSet[] =
  //   convertDelegationSetsDelegateIdsToAddress(allDelegationSets)

  // const allOptoutsForEachChain: Optout[][] = R.map<Context, Optout[]>(
  //   R.propOr([] as Optout[], "optouts"),
  //   allContexts,
  // )

  // // 2. merge delegationSets and optouts
  const mergedDelegatorToDelegationSets = mergeDelegationSets(
    allV2DelegationSets.concat(allV1Delegations),
  )
  console.log(
    `[${spaceName}] mergedDelegatorToDelegationSets size:`,
    Object.keys(mergedDelegatorToDelegationSets).length,
  )

  const mergedDelegatorToDelegationSetsExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] mergedDelegatorToDelegationSets execution time: ${
      (mergedDelegatorToDelegationSetsExecutionDoneTime -
        fetchDelegationSetsFromAllChainsExecutionDoneTime) /
      1000
    } seconds`,
  )

  const optouts: Optout[] = await theGraph.fetchOptoutsFromAllChains(
    spaceName,
    timestamp,
  )
  const fetchOptoutsFromAllChainsExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] fetchOptoutsFromAllChains execution time: ${
      (fetchOptoutsFromAllChainsExecutionDoneTime -
        mergedDelegatorToDelegationSetsExecutionDoneTime) /
      1000
    } seconds`,
  )

  const listOfOptouts = mergeDelegatorOptouts(optouts)
  const mergeDelegatorOptoutsExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] mergeDelegatorOptouts execution time: ${
      (mergeDelegatorOptoutsExecutionDoneTime -
        fetchOptoutsFromAllChainsExecutionDoneTime) /
      1000
    } seconds`,
  )

  // // 3. remove optout delegators (and recompute dominators, across delegationSets)
  const finalDelegatorToDelegationSets = removeOptouts(
    listOfOptouts,
    mergedDelegatorToDelegationSets,
  )
  const removeOptoutsExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] removeOptouts execution time: ${
      (removeOptoutsExecutionDoneTime -
        mergeDelegatorOptoutsExecutionDoneTime) /
      1000
    } seconds`,
  )

  // // 4. generate the delegation ratio map (delegate -> delegator -> ratio)
  const delegations = generateDelegationRatioMap(finalDelegatorToDelegationSets)
  const generateDelegationRatioMapExecutionDoneTime = Date.now()
  console.log(
    `[${spaceName}] generateDelegationRatioMapExecutionDoneTime execution time: ${
      (generateDelegationRatioMapExecutionDoneTime -
        removeOptoutsExecutionDoneTime) /
      1000
    } seconds`,
  )

  return delegations
}

const getTimestampForBlocknumber = async (
  mainChainId: number,
  snapshotSpace: string,
  blocknumber?: number,
): Promise<number | undefined> => {
  if (blocknumber == null) {
    console.log(`[${snapshotSpace}] No blocknumber. Getting newest available.`)
    return
  }

  console.log(`[${snapshotSpace}] Main chain chainId: ${mainChainId}`)
  const ethersProvider = new ethers.providers.InfuraProvider(
    Number(mainChainId),
  )
  const block = await ethersProvider.getBlock(blocknumber)

  console.log(
    `[${snapshotSpace}] Timestamp of block number ${blocknumber} is: ${block.timestamp}`,
  )
  return block.timestamp
}

const getV1Delegations = async (
  spaceName: string,
  v1Networks: number[],
  timestamp?: number,
): Promise<DelegationSet[]> => {
  const allV1Delegations = [] as DelegationSet[]

  for (const v1Network of v1Networks) {
    const v1Delegations = await fetchDelegationSetsFromV1(
      spaceName,
      v1Network,
      timestamp,
    )
    allV1Delegations.push(...v1Delegations)
  }
  return allV1Delegations
}

export const fetchDelegationSetsFromV1 = async (
  spaceName: string,
  chainId: number, // chain id
  timestamp?: number,
): Promise<DelegationSet[]> => {
  console.log(
    `[${spaceName}] fetchDelegationSetsFromV1 snapshot space: ${spaceName}, network: ${chainId}, blocknumber: ${timestamp}`,
  )
  const delegations: { delegator: string; space: string; delegate: string }[] =
    await getV1DelegatesBySpace(spaceName, chainId.toString(), timestamp)
  console.log(
    `[${spaceName}] Got ${delegations.length} delegations from V1. This includes global delegations and delegations specific to space: ${spaceName} on chainId: ${chainId}`,
  )
  // const filtered = delegations.filter((d) => d.space === spaceName) // if we want to ignore global delegations and only use space specific delegations
  const delegationSets: DelegationSet[] = delegations.map((d) => ({
    fromAccount: { id: d.delegator },
    denominator: "1",
    creationTimestamp: "0", // This makes ny delegations on V2 replace V1 delegations
    delegations: [
      {
        toAccount: {
          id: d.delegate,
        },
        numerator: "1",
      },
    ],
  }))
  return delegationSets
}
