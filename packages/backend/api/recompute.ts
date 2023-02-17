import type { VercelRequest, VercelResponse } from "@vercel/node"
import R from "ramda"
import { computeAbsoluteVoteWeights } from "../lib/compute-vote-weights"
import { getAllDelegationsTo } from "../lib/data"
import { fetchVoteWeights } from "../lib/services/snapshot"
import * as storage from "../lib/services/storage-write"
import { getCrossContexts } from "../lib/services/the-graph"

// TODO: make more generic
const SNAPSHOT_SPACE = process.env.SNAPSHOT_SPACE!
if (SNAPSHOT_SPACE == null) {
  throw Error("SNAPSHOT_SPACE is not defined")
}

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
  const delegations = await getAllDelegationsTo(SNAPSHOT_SPACE)
  console.log("delegations:", delegations)
  if (delegations == null) {
    console.log("Done: no delegations found")
    return response.status(200).json({
      body: "ok, no delegations found",
    })
  }

  console.log("2. Get vote weights for all delegators")

  const delegatingAccounts = R.uniq(
    R.flatten(Object.values(delegations).map((member) => Object.keys(member))),
  )
  console.log("delegatingAccounts:", delegatingAccounts)
  const voteWeights = await fetchVoteWeights(SNAPSHOT_SPACE, delegatingAccounts)
  console.log("voteWeights:", voteWeights)

  console.log("3. Compute vote weights for all delegations")
  const [delegatedVoteWeight, delegatedVoteWeightByAccount] =
    computeAbsoluteVoteWeights(delegations, voteWeights)

  console.log("delegatedVoteWeightByAccount:", delegatedVoteWeightByAccount)

  console.log("4. Store delegated vote weights")
  await storage.storeDelegatedVoteWeight(
    SNAPSHOT_SPACE,
    delegatedVoteWeight,
    delegatedVoteWeightByAccount,
  )

  console.log("Done!")
  response.status(200).json({
    body: "ok",
  })
}
