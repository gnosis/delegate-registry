import R from "ramda"
import {
  DelegateToDelegatorToRatio,
  Delegation,
  DelegationSet,
  DelegatorToDelegationSet,
} from "../../types"

/**
 * Transforms a (delegator -> delegation set) map into a (delegate -> delegator -> ratio) map.
 *
 * @param delegatorToDelegationSets - Each delegator's delegation set
 * @returns A map of each delegate to a map of each delegator to their ratio
 * (delegate -> delegator -> ratio)
 */

export const generateDelegationRatioMap = (
  delegatorToDelegationSets: DelegatorToDelegationSet,
): DelegateToDelegatorToRatio =>
  R.reduce<DelegationSet, DelegateToDelegatorToRatio>(
    (acc, delegationSet) => {
      R.forEach<Delegation>((delegation) => {
        acc[delegation.delegate.id] = {
          // `.slice(-40)` removes the prefix since its not in use yet. This should be done in the subgraph.
          ...acc[delegation.delegate.id],
          [delegationSet.account.id]: {
            numerator: delegation.numerator,
            denominator: delegationSet.denominator,
          },
        }
      })(delegationSet.delegations)
      return acc
    },
    {},
    R.values(delegatorToDelegationSets),
  )
