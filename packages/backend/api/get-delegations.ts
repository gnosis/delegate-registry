import { getDelegatedVoteWeight } from "../lib/services/storage/read"
/**
 * To be called by the "API POST strategy" snapshot strategy:
 * https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/api-post
 */
export const config = {
  runtime: "edge",
}

export default async (req: Request) => {
  const body = await req.json()
  console.log("Request body: ", body)
  const { addresses, snapshotSpace } = body

  const voteWeights = await getDelegatedVoteWeight(snapshotSpace)
  console.log("greeting", voteWeights)

  return new Response(JSON.stringify({ score: voteWeights }))
}
