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
