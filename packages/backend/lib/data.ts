import * as theGraph from "./services/the-graph"
import {
  mergeDelegationOptouts as mergeDelegatorOptouts,
  mergeDelegationSets,
} from "./cross-chain-merge"
import { removeOptouts } from "./remove-optouts"
import { GetContextQuery } from "../.graphclient"
import { computeDelegations } from "./compute-delegations"
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
  const responds = await theGraph.getContextIdsFromAllChains()
  return R.uniq(responds.map((_) => _.id))
}

export const getAllDelegationsTo = async (snapshotSpace: string) => {
  // get context from all chains
  console.log("snapshotSpace", snapshotSpace)
  const responds = await theGraph.getContextFromAllChains(snapshotSpace)

  // 1. merge delegationSets and optouts
  const mergedDelegationSets = mergeDelegationSets(responds)
  const mergedOptouts = mergeDelegatorOptouts(responds)

  console.log("mergedOptouts:")
  console.log(JSON.stringify(mergedOptouts))

  console.log("mergedDelegationSets:")
  console.log(JSON.stringify(mergedDelegationSets))
  // 2. remove optout delegators (and recompute dominators, across delegationSets)
  const finalDelegationSets = removeOptouts(mergedOptouts, mergedDelegationSets)

  console.log("finalDelegationSets:")
  console.log(JSON.stringify(finalDelegationSets))

  const delegations = computeDelegations(finalDelegationSets)

  console.log("delegations:")
  console.log(JSON.stringify(delegations))

  return delegations
}
