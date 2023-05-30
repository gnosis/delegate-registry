import * as theGraph from "./services/the-graph"
import {
  mergeDelegationOptouts as mergeDelegatorOptouts,
  mergeDelegationSets,
} from "./data-transformers/merge-delegation-sets"
import { removeOptouts } from "./data-transformers/remove-optouts"
import { generateDelegationRatioMap } from "./data-transformers/generate-delegation-ratio-map"
import R from "ramda"
import { Context, DelegationSet, Optout } from "../types"
import {
  convertDelegationSetAddressesToAddress,
  convertDelegationSetsDelegateIdsToAddress,
  convertOptoutsDelegateIdsToAddress,
} from "./data-transformers/convert-to-address"
import { fetchSnapshotSpaceSettings } from "./services/snapshot"
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
 * @param snapshotSpace - The snapshot space (context id) to fetch delegations for
 * @returns Map of (delegate -> delegator -> ratio)
 */
export const getDelegationRatioMap = async (
  snapshotSpace: string,
  blocknumber?: number,
) => {
  const timestamp = await getTimestampForBlocknumber(snapshotSpace, blocknumber)

  // 1. fetch context from all chains
  const allContexts: Context[] = await theGraph.fetchContextFromAllChains(
    snapshotSpace,
    timestamp,
  )
  const delegationSetsForEachChain: DelegationSet[][] =
    convertDelegationSetsDelegateIdsToAddress(
      // optimization option: this can be done when writing to the database, we just have to always convert to lowercased addresses (instead of the checksumable address version)
      R.map<Context, DelegationSet[]>(
        R.propOr([] as DelegationSet[], "delegationSets"),
        allContexts,
      ),
    )

  const allOptoutsForEachChain: Optout[][] = R.map<Context, Optout[]>(
    R.propOr([] as Optout[], "optouts"),
    allContexts,
  )

  // 2. merge delegationSets and optouts
  const mergedDelegatorToDelegationSets = mergeDelegationSets(
    delegationSetsForEachChain,
  )
  const listOfOptouts = mergeDelegatorOptouts(allOptoutsForEachChain)

  // 3. remove optout delegators (and recompute dominators, across delegationSets)
  const finalDelegatorToDelegationSets = removeOptouts(
    listOfOptouts,
    mergedDelegatorToDelegationSets,
  )

  // 4. generate the delegation ratio map (delegate -> delegator -> ratio)
  const delegations = generateDelegationRatioMap(finalDelegatorToDelegationSets)

  return delegations
}

const getTimestampForBlocknumber = async (
  snapshotSpace: string,
  blocknumber?: number,
): Promise<number | undefined> => {
  if (blocknumber == null) {
    console.log(`[${snapshotSpace}] No blocknumber. Getting newest available.`)
    return
  }

  let mainChainId = "1"

  try {
    const useTestHub = false
    mainChainId = (await fetchSnapshotSpaceSettings(snapshotSpace, useTestHub))
      .network
  } catch (e) {
    // TODO: WARNING: If no snapshot space if found, this tries to get strategies from the Snapshot test hub.
    console.log(
      `[${snapshotSpace}] No snapshot space found on the SNapshot hub. Will try to get it from the Snapshot test Hub.`,
    )
    const useTestHub = true
    mainChainId = (await fetchSnapshotSpaceSettings(snapshotSpace, useTestHub))
      .network
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
