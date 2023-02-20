import { getDelegatedVoteWeight } from "../lib/services/storage/read"
import { get } from "@vercel/edge-config"
import * as R from "ramda"
import { utils } from "ethers"
const { getAddress } = utils

/**
 * To be called by the "API POST strategy" snapshot strategy:
 * https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/api-post
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
  try {
    addresses = R.map(getAddress, addresses)
  } catch (e) {
    console.log("Error parsing addresses: ", e)
    return new Response(
      "The `addresses` parameter is required with an array of valid addresses.",
      { status: 400 },
    )
  }

  const voteWeights = await getDelegatedVoteWeight(snapshotSpace)
  if (voteWeights == null || R.isEmpty(voteWeights)) {
    console.log("No vote weights found for space: ", snapshotSpace)
    return new Response(JSON.stringify({ score: [] }), { status: 200 })
  }

  const relevantVoteWeights = R.pickAll(addresses, voteWeights)

  const relevantVoteWightsAsScores = R.map(
    ([address, score = 0]) => ({ address, score }),
    R.toPairs(relevantVoteWeights),
  )

  return new Response(JSON.stringify(relevantVoteWightsAsScores))
}
