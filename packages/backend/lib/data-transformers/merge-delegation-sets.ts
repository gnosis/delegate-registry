import R from "ramda"
import { DelegationSet, DelegatorToDelegationSet, Optout } from "../../types"

/**
 * Merges multiple arrays of delegation sets into one array.
 *
 * @remarks
 * If a delegator has delegation sets in multiple arrays we use the newest and
 * discard others.
 *
 * @param delegationSetsForEachChain - An array (one for each chain) of arrays
 * of delegation sets for a specific snapshot space
 * @returns all delegation sets merged
 */
export const mergeDelegationSets = (
  delegationSetsForEachChain: DelegationSet[][],
): DelegatorToDelegationSet =>
  R.compose(
    R.reduce<DelegationSet, DelegatorToDelegationSet>(
      (sets, set) =>
        // if the account is already in the (delegation)sets, we keep the one
        // with the highest `delegationUpdated`
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
  )(delegationSetsForEachChain)

/**
 * Merges multiple arrays of optouts into one array, and returns
 * a list of the addresses of delegates that have opted out.
 *
 * @remarks
 * If a delegate has optouts in multiple arrays we use the newest status and
 * discard others.
 *
 * @param optoutsForEachChain - an array (one for each chain) of arrays of
 * optouts for a specific snapshot space
 * @returns a list of the addresses of delegates that have opted out
 */
export const mergeDelegationOptouts = (
  optoutsForEachChain: Optout[][],
): string[] =>
  R.compose(
    R.keys,
    R.filter(R.prop<boolean>("status")),
    R.reduce<Optout, Record<string, boolean>>(
      (optouts, optout) =>
        // if the delegate is already in the optouts, we keep the one with the highest `updated`
        R.mergeWith(
          (optout1: Optout, optout2: Optout) =>
            optout1.updated > optout2.updated ? optout1 : optout2,
          optouts,
          {
            [optout.delegate.id]: optout,
          },
        ),
      {},
    ),
    R.flatten,
  )(optoutsForEachChain)
