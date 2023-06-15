import { GetDelegationSetsQuery } from "../lib/services/the-graph/.graphclient"
type NonNullable<T> = Exclude<T, null | undefined>
type Unpacked<T> = T extends (infer U)[] ? U : T
type OptionalPropertyOf<T extends object> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K
  }[keyof T],
  undefined
>

export type DelegationSet = Unpacked<
  NonNullable<GetDelegationSetsQuery["delegationSets"]>
>
export type Delegation = NonNullable<DelegationSet["delegations"]>
// export type Optout = NonNullable<Unpacked<Context["optouts"]>>
// export type Context = NonNullable<GetDelegationSetsQuery[""]>

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
