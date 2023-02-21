// To be used by the Vercel Edge Function
import { get } from "@vercel/edge-config"
import * as R from "ramda"

/**
 * Returns the delegated vote weight for the given addresses.
 *
 * Only addresses with vote weight are returned.
 *
 * @param snapshotSpace
 * @param addresses
 * @returns a map of address to delegated vote weight (addresses with no delegated vote weight are not returned)
 */
export const getDelegatedVoteWeight = async (
  snapshotSpace: string,
  addresses: string[],
) => {
  const voteWeights = await get<{
    [delegate: string]: number
  }>(`${snapshotSpace.replace(".", "_")}-delegatedVoteWeight`)
  return R.pick(addresses, voteWeights) ?? {}
}

export const getTopDelegatesByVoteWeight = async (
  snapshotSpace: string,
  numberOfDelegatesToReturn: number = 100,
) => {
  const voteWeights =
    (await get<{
      [delegate: string]: number
    }>(`${snapshotSpace.replace(".", "_")}-delegatedVoteWeight`)) ?? {}

  const pairs = R.toPairs<number>(voteWeights)
  const sortedPairs = R.reverse(R.sortBy<[string, number]>(R.prop(1), pairs))

  return R.take(numberOfDelegatesToReturn, sortedPairs)
}

export const getTopDelegatorsForDelegate = async (
  snapshotSpace: string,
  delegateAddress: string,
  numberOfDelegatorsToReturn: number = 100,
) => {
  const delegators =
    (await get<{
      [delegate: string]: {
        [delegatorAddress: string]: number
      }
    }>(`${snapshotSpace.replace(".", "_")}-delegatedVoteWeightByAccount`)) ?? {}
  const pairs = R.toPairs<number>(delegators[delegateAddress])
  const sortedPairs = R.reverse(R.sortBy<[string, number]>(R.prop(1), pairs))

  return R.take(numberOfDelegatorsToReturn, sortedPairs)
}
