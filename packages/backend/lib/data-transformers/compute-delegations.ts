import R from "ramda"
import { Delegation, DelegationSet, Ratio } from "../data"
import { utils } from "ethers"
const { getAddress } = utils

export const computeDelegations = (
  delegationSets: Record<string, DelegationSet>,
): { [delegate: string]: { [account: string]: Ratio } } =>
  R.reduce<DelegationSet, { [delegate: string]: { [account: string]: Ratio } }>(
    (acc, delegationSet) => {
      R.forEach<Delegation>((delegation) => {
        acc[getAddress(delegation.delegate.id.slice(-40))] = {
          // `.slice(-40)` removes the prefix since its not in use yet. This should be done in the subgraph.
          ...acc[getAddress(delegation.delegate.id.slice(-40))],
          [getAddress(delegationSet.account.id)]: {
            numerator: delegation.numerator,
            denominator: delegationSet.denominator,
          },
        }
      })(delegationSet.delegations)
      return acc
    },
    {},
    R.values(delegationSets),
  )
