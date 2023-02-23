import { GetContextQuery } from "../lib/services/the-graph/.graphclient"

type Unpacked<T> = T extends (infer U)[] ? U : T
export type Context = Unpacked<GetContextQuery["crossContext"]>
export type DelegationSet = Unpacked<Context["delegationSets"]>
export type Optout = Unpacked<Context["optouts"]>
export type Delegation = Unpacked<DelegationSet["delegations"]>

export type Ratio = Readonly<{
  numerator: number
  denominator: number
}>

/**
 * (delegator address -> delegationSet)
 */
export type DelegatorToDelegationSet = {
  [delegator: string]: DelegationSet
}

/**
 * (delegate address -> delegator address -> ratio)
 */
export type DelegateToDelegatorToRatio = {
  [delegate: string]: {
    [delegator: string]: Ratio
  }
}

export type DelegateToVoteWeight = {
  [delegate: string]: number
}

export type DelegateToDelegatorToVoteWeight = {
  [delegate: string]: {
    [delegatorAddress: string]: number
  }
}
