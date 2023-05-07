import {
  getDelegatedVoteWeight,
  getLastUpdateTime,
} from "../../../lib/services/storage/read"
import * as R from "ramda"
import { utils } from "ethers"
const { getAddress } = utils

/**
 * Returns the delegated vote weight for a given array of addresses.
 *
 * To be called by the "API POST strategy" snapshot strategy:
 * https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/api-post
 *
 * @example responds:
 *{
 * "score": [
 *   {
 *     "score": 123,
 *     "address": "0xEA2E9cEcDFF8bbfF107a349aDB9Ad0bd7b08a7B7"
 *   },
 *   {
 *     "score": 456,
 *     "address": "0x3c4B8C52Ed4c29eE402D9c91FfAe1Db2BAdd228D"
 *   },
 * ],
, * "updateTime": 1677158495
 *}
 */
export const config = {
  runtime: "experimental-edge",
}

export default async (req: Request) => {
  const body = await req.json()
  const url = new URL(req.url)
  const snapshotSpace = url.searchParams.get("space")
  if (snapshotSpace == null) {
    return new Response("Missing `space` parameter (Snapshot space).", {
      status: 400,
    })
  }
  let { addresses } = body as { addresses: string[] }
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return new Response(
      "The `addresses` parameter is required with an array of valid addresses.",
      { status: 400 },
    )
  }
  try {
    addresses = R.map(getAddress, addresses)
  } catch (e) {
    console.log("Error parsing addresses: ", e)
    return new Response(
      "The `addresses` parameter is required with an array of valid addresses.",
      { status: 400 },
    )
  }

  const voteWeights = await getDelegatedVoteWeight(snapshotSpace, addresses)
  if (R.isEmpty(voteWeights)) {
    console.log(
      "No vote weights found for the provided addresses in the specified Snapshot Space: ",
      snapshotSpace,
    )
    return new Response(JSON.stringify({ score: [] }), { status: 200 })
  }

  const relevantVoteWightsAsScores = R.map(
    ([address, score]) => ({ address, score }),
    R.toPairs(voteWeights),
  )

  const updateTime = await getLastUpdateTime(snapshotSpace)

  return new Response(
    JSON.stringify({ score: relevantVoteWightsAsScores, updateTime }),
  )
}
