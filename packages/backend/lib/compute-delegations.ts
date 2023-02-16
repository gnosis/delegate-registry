import R from "ramda"
import { Delegation, DelegationSet, Ratio } from "./data"
import { utils } from "ethers"
const { getAddress } = utils

export const computeDelegations = (
  delegationSets: Record<string, DelegationSet>,
): { [delegate: string]: { [account: string]: Ratio } } =>
  R.reduce<DelegationSet, { [delegate: string]: { [account: string]: Ratio } }>(
    (acc, delegationSet) => {
      R.forEach<Delegation>((delegation) => {
        acc[delegation.delegate.id] = {
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
