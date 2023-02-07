import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getVoteWeights } from "../lib/services/snapshot-api"

export default async function getDelegations(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { body } = request
  console.log("Request body: ", body)
  const { addresses } = body

  //TODO: this is a test, not the data we want
  const voteWeights = await getVoteWeights(addresses)
  console.log(voteWeights)

  response.status(200).json({
    body: request.body,
    voteWeights,
  })
}
