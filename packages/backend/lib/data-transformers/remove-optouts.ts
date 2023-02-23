import R from "ramda"
import {
  Delegation,
  DelegationSet,
  DelegatorToDelegationSet,
} from "../../types"

/**
 * Removes optouts from a list from a (delegator -> delegation set) map.
 *
 * @remarks
 * This also recomputes the denominator for each delegation set were a delegate
 * in the set has opted out.
 *
 * @param listOfOptouts - List of delegates that have opted out
 * @param delegationSets - Delegation sets to remove optouts from
 * @returns A delegation set with optouts removed
 */
export const removeOptouts = (
  listOfOptouts: string[],
  delegationSets: DelegatorToDelegationSet,
): DelegatorToDelegationSet =>
  R.compose(
    R.reduce<string, DelegatorToDelegationSet>((sets, optoutDelegate) => {
      // find all sets with the optoutDelegate
      // recompute denominator and remove optout delegate from set
      // This is slow. How can we speed up?
      return R.reduce<DelegationSet, DelegatorToDelegationSet>(
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
  )(listOfOptouts)
