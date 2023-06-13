import R from "ramda"
import { DelegateToValue, Delegation, DelegationSet } from "../../types"

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
  delegationSets: DelegateToValue<DelegationSet>,
): DelegateToValue<DelegationSet> =>
  R.compose(
    R.reduce<string, DelegateToValue<DelegationSet>>((sets, optoutDelegate) => {
      // find all sets with the optoutDelegate
      // recompute denominator and remove optout delegate from set
      // This is slow. How can we speed up?
      return R.reduce<DelegationSet, DelegateToValue<DelegationSet>>(
        (acc, delegationSet) => {
          // console.log(
          //   "delegationSet: ",
          //   JSON.stringify(delegationSet, null, "  "),
          // )
          const optoutDelegation = delegationSet.delegations.find(
            (delegate) => delegate.toAccount.id === optoutDelegate,
          )
          // console.log("optoutDelegate: ", optoutDelegate)
          // console.log("optoutDelegation: ", optoutDelegation)
          if (optoutDelegation != null) {
            const delegations = delegationSet.delegations.filter(
              (delegate) => delegate.toAccount.id !== optoutDelegate,
            )
            if (!R.isEmpty(delegations)) {
              acc[delegationSet.fromAccount.id] = {
                ...delegationSet,
                denominator:
                  delegationSet.denominator - optoutDelegation.numerator,
                delegations,
              }
            }
          } else {
            acc[delegationSet.fromAccount.id] = delegationSet
          }
          return acc
        },
        {},
        R.values(sets),
      )
    }, delegationSets),
  )(listOfOptouts)
