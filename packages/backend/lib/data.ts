import * as theGraph from "./services/the-graph"
import {
  mergeDelegationOptouts as mergeDelegatorOptouts,
  mergeDelegationSets,
} from "./data-transformers/cross-chain-merge"
import { removeOptouts } from "./data-transformers/remove-optouts"
import { GetContextQuery } from "../.graphclient"
import { computeDelegations } from "./data-transformers/compute-delegations"
import R from "ramda"

type Unpacked<T> = T extends (infer U)[] ? U : T
export type Context = Unpacked<GetContextQuery["crossContext"]>
export type DelegationSet = Unpacked<Context["delegationSets"]>
export type Optout = Unpacked<Context["optouts"]>
export type Delegation = Unpacked<DelegationSet["delegations"]>

export type Ratio = {
  numerator: number
  denominator: number
}

export const getSnapshotSpaces = async () => {
  const responds = await theGraph.fetchContextIdsFromAllChains()
  return R.uniq(responds.map((_) => _.id))
}

export const getAllDelegationsTo = async (snapshotSpace: string) => {
  // 1. get context from all chains
  const responds = await theGraph.fetchContextFromAllChains(snapshotSpace)

  // 2. merge delegationSets and optouts
  const mergedDelegationSets = mergeDelegationSets(responds)
  const mergedOptouts = mergeDelegatorOptouts(responds)

  // 3. remove optout delegators (and recompute dominators, across delegationSets)
  const finalDelegationSets = removeOptouts(mergedOptouts, mergedDelegationSets)

  // 4. compute delegations (delegate -> delegator -> ratio)
  const delegations = computeDelegations(finalDelegationSets)

  return delegations
}
