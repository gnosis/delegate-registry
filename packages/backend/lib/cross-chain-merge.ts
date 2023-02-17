import R from "ramda"
import { Context, DelegationSet, Optout } from "./data"

export const mergeDelegationSets = (
  data: Context[],
): Record<string, DelegationSet> =>
  R.compose(
    R.reduce<DelegationSet, Record<string, DelegationSet>>(
      (sets, set) =>
        // if the account is already in the (delegation)sets, we keep the one with the highest `delegationUpdated`
        R.mergeWith(
          (set1: DelegationSet, set2: DelegationSet) =>
            set1.delegationUpdated > set2.delegationUpdated ? set1 : set2,
          sets,
          {
            [set.account.id]: set,
          },
        ),
      {},
    ),
    R.flatten,
    R.map<Context, DelegationSet[]>((context) => context.delegationSets),
  )(data)

export const mergeDelegationOptouts = (data: Context[]): string[] =>
  R.compose(
    R.map((_: string) => _.slice(-40)), // remove padding (as its not currently used for anything), this should be in the subgraph
    R.keys,
    R.filter((_: boolean) => _),
    R.reduce<Optout, Record<string, boolean>>(
      (optouts, optout) =>
        // if the delegate is already in the soptouts, we keep the one with the highest `updated`
        R.mergeWith(
          (optout1: Optout, optout2: Optout) =>
            optout1.updated > optout2.updated ? optout1.status : optout2.status,
          optouts,
          {
            [optout.delegate.id]: optout.status,
          },
        ),
      {},
    ),
    R.flatten,
    R.map<Context, Optout[]>((context) => context.optouts),
  )(data)
