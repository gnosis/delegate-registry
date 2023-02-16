import R from "ramda"
import { Delegation, DelegationSet } from "./data"

export const removeOptouts = (
  mergedOptouts: string[],
  delegationSets: Record<string, DelegationSet>,
): Record<string, DelegationSet> =>
  R.compose(
    R.reduce<string, Record<string, DelegationSet>>((sets, optoutDelegate) => {
      // find all sets with the optoutDelegate
      // recompute denominator and remove optout delegate from set
      // This is slow. How can we speed up?
      return R.reduce<DelegationSet, Record<string, DelegationSet>>(
        (acc, delegationSet) => {
          const optoutDelegation = R.find<Delegation>(
            R.pathEq(["delegate", "id"], optoutDelegate),
          )(delegationSet.delegations)
          if (optoutDelegation != null) {
            acc[delegationSet.account.id] = {
              ...delegationSet,
              denominator:
                delegationSet.denominator - optoutDelegation.numerator,
              delegations: R.reject(
                R.pathEq(["delegate", "id"], optoutDelegate),
                delegationSet.delegations,
              ),
            }
          } else {
            acc[delegationSet.account.id] = delegationSet
          }
          return acc
        },
        {},
        R.values(sets),
      )
    }, delegationSets),
  )(mergedOptouts)
