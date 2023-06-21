import R from "ramda"
import { DelegateToValue, DelegationSet, Optout } from "../../types"

/**
 * Merges multiple arrays of delegation sets into one array.
 *
 * @remarks
 * If a delegator has delegation sets in multiple arrays we use the newest and
 * discard others.
 *
 * @param delegationSetsForAllChain - An array (one for each chain) of arrays
 * of delegation sets for a specific snapshot space
 * @returns all delegation sets merged
 */
export const mergeDelegationSets = (
  delegationSetsForAllChain: DelegationSet[],
): DelegateToValue<DelegationSet> =>
  R.reduce<DelegationSet, DelegateToValue<DelegationSet>>(
    (sets, set) =>
      // if the account is already in the (delegation)sets, we keep the one
      // with the highest `delegationUpdated`
      R.mergeWith(
        (set1: DelegationSet, set2: DelegationSet) =>
          set1.creationTimestamp > set2.creationTimestamp ? set1 : set2,
        sets,
        {
          [set.fromAccount.id]: set,
        },
      ),
    {},
  )(delegationSetsForAllChain)

/**
 * Merges multiple arrays of optouts into one array, and returns
 * a list of the addresses of delegates that have opted out.
 *
 * @remarks
 * If a delegate has optouts in multiple arrays we use the newest status and
 * discard others.
 *
 * @param optoutsForAllChains - an array (one for each chain) of arrays of
 * optouts for a specific snapshot space
 * @returns a list of the addresses of delegates that have opted out
 */
export const mergeDelegationOptouts = (
  optoutsForAllChains: Optout[],
): string[] =>
  R.compose(
    R.keys,
    R.filter(R.prop<boolean>("status")),
    R.reduce<Optout, Record<string, boolean>>(
      (optouts, optout) =>
        // if the delegate is already in the optouts, we keep the one with the highest `updated`
        R.mergeWith(
          (optout1: Optout, optout2: Optout) =>
            optout1.creationTimestamp > optout2.creationTimestamp
              ? optout1
              : optout2,
          optouts,
          {
            [optout.account.id]: optout,
          },
        ),
      {},
    ),
  )(optoutsForAllChains)
