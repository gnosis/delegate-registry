// if the subgraph changes, check this code is still valid
import { DelegationSet, Optout } from "../../types"
import { utils } from "ethers"
import R from "ramda"
const { getAddress } = utils

/**
 * Convert delegate ids and account ids to addresses.
 *
 * @param delegationSet - Delegation set to update
 * @returns The same delegation set with the delegate ids and account ids converted to an address
 */
export const convertDelegationSetAddressesToAddress = (
  delegationSet: DelegationSet,
): DelegationSet => ({
  ...delegationSet,
  fromAccount: {
    ...delegationSet.fromAccount,
    id: getAddress(delegationSet.fromAccount.id),
  },
  delegations: (delegationSet.delegations ?? []).map((delegation) => ({
    ...delegation,
    toAccount: {
      ...delegation.toAccount,
      id: getAddress(delegation.toAccount.id),
    },
  })),
})

export const convertDelegationSetsDelegateIdsToAddress = (
  delegationSets: DelegationSet[][],
): DelegationSet[][] =>
  R.map(R.map(convertDelegationSetAddressesToAddress), delegationSets)

/**
 * Convert delegate's id to an address.
 *
 * @param optout - Optout to update
 * @returns The same optout with the delegate's id converted to an address
 */
export const convertOptoutDelegateIdToAddress = (optout: Optout): Optout => ({
  ...optout,
  account: {
    ...optout.account,
    id: getAddress(optout.account.id),
  },
})

export const convertOptoutsDelegateIdsToAddress = (
  optouts: Optout[][],
): Optout[][] => R.map(R.map(convertOptoutDelegateIdToAddress), optouts)
