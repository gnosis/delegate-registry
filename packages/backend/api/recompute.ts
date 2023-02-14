import type { VercelRequest, VercelResponse } from "@vercel/node"
import { computeDelegatedVoteWeights } from "../lib/compute-vote-weights"
import { getVoteWeights } from "../lib/services/snapshot-api"
import * as storage from "../lib/services/storage"
import { getAllDelegationsTo as getAllRepresentatives } from "../lib/services/the-graph"
import { utils } from "ethers"

const { getAddress } = utils

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
  const representatives = await getAllRepresentatives()

  const delegations = representatives.data?.tos.reduce(
    (acc, { id: representative, delegations }) => {
      acc[getAddress(representative.slice(-40))] = delegations.reduce(
        (acc, { from: { id: delegator }, ratio }) => {
          acc[getAddress(delegator)] = ratio
          return acc
        },
        {} as Record<string, number>,
      )
      return acc
    },
    {} as Record<string, Record<string, number>>,
  )
  if (delegations == null) {
    console.log("Done: no delegations found")
    return response.status(200).json({
      body: "ok, no delegations found",
    })
  }

  console.log("2. Get vote weights for all delegators")
  const delegators = Object.keys(delegations).reduce(
    (representatives, representative) => [
      ...representatives,
      ...Object.keys(delegations[representative]),
    ],
    [] as string[],
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
