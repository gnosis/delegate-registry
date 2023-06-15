import R from "ramda"
import {
  DelegateToDelegatorToValue,
  DelegateToValue,
  Delegation,
  DelegationSet,
  Ratio,
} from "../../types"

/**
 * Transforms a (fromAccount -> delegation set) map into a (toAccount -> fromAccount -> ratio) map.
 *
 * @param delegatorToDelegationSets - Each delegator's delegation set
 * @returns A map of each delegate to a map of each delegator to their ratio
 * (delegate -> delegator -> ratio)
 */

export const generateDelegationRatioMap = (
  delegatorToDelegationSets: DelegateToValue<DelegationSet>,
): DelegateToDelegatorToValue<Ratio> =>
  R.reduce<DelegationSet, DelegateToDelegatorToValue<Ratio>>(
    (acc, delegationSet) => {
      R.forEach<Delegation>((delegation) => {
        acc[delegation.toAccount.id] = {
          ...acc[delegation.toAccount.id],
          [delegationSet.fromAccount.id]: {
            numerator: delegation.numerator,
            denominator: delegationSet.denominator,
          },
        }
      })(delegationSet.delegations ?? [])
      return acc
    },
    {},
    R.values(delegatorToDelegationSets),
  )
