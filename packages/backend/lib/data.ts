import * as theGraph from "./services/the-graph"
import {
  mergeDelegationOptouts as mergeDelegatorOptouts,
  mergeDelegationSets,
} from "./data-transformers/merge-delegation-sets"
import { removeOptouts } from "./data-transformers/remove-optouts"
import { generateDelegationRatioMap } from "./data-transformers/generate-delegation-ratio-map"
import R from "ramda"
import { DelegationSet, Optout } from "../types"
import {
  convertDelegationSetAddressesToAddress,
  convertDelegationSetsDelegateIdsToAddress,
  convertOptoutsDelegateIdsToAddress,
} from "./data-transformers/convert-to-address"

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
  if (blocknumber != null) {
    // get the timestamp of the blocknumber
    // for each chain, get the block number of the last block before the timestamp
    // for each chain, get the delegations at that block number
    // can we still use the graph's graph cli for this?
  }

  // 1. fetch context from all chains
  const allContexts = await theGraph.fetchContextFromAllChains(
    snapshotSpace,
    blocknumber,
  )
  const delegationSetsForEachChain: DelegationSet[][] =
    convertDelegationSetsDelegateIdsToAddress(
      // optimization option: this can be done when writing to the database, we just have to always convert to lowercased addresses (instead of the checksumable address version)
      R.map(R.prop("delegationSets"), allContexts),
    )

  const allOptoutsForEachChain: Optout[][] = R.map(
    R.prop("optouts"),
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
