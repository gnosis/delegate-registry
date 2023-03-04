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

export type DelegateToValue<T = number> = {
  [delegate: string]: T
}

export type DelegateToDelegatorToValue<T = number> = {
  [delegate: string]: {
    [delegatorAddress: string]: T
  }
}
