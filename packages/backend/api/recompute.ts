import type { VercelRequest, VercelResponse } from "@vercel/node"
import R from "ramda"
import { computeDelegatedVoteWeights } from "../lib/compute-vote-weights"
import { getVoteWeights } from "../lib/services/snapshot-api"
import * as storage from "../lib/services/storage"
import { getAllDelegationsTo as getAllRepresentatives } from "../lib/services/the-graph"

/**
 * Recomputes the vote weights for all delegations, and stores the results.
 *
 * Triggered by a cron job
 */
export default async function getDelegations(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log("1. Fetch and merge all delegations across all chains")

  // 1.1. - get all to delegations
  const delegations = await getAllRepresentatives()

  if (delegations == null) {
    console.log("Done: no delegations found")
    return response.status(200).json({
      body: "ok, no delegations found",
    })
  }

  console.log("2. Get vote weights for all delegators")
  const delegators = R.uniq(
    Object.keys(delegations).reduce(
      (representatives, representative) => [
        ...representatives,
        ...Object.keys(delegations[representative]),
      ],
      [] as string[],
    ),
  )
  const voteWeights = await getVoteWeights(delegators)

  console.log("3. Compute vote weights for all delegations")
  const delegatedVoteWeight = computeDelegatedVoteWeights(
    delegations,
    voteWeights,
  )

  console.log("4. Store delegated vote weights")
  await storage.storeNewSetOfDelegatedVoteWeight(delegatedVoteWeight)

  console.log("Done!")
  response.status(200).json({
    body: "ok",
  })
}
