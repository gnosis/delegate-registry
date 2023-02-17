import type { VercelRequest, VercelResponse } from "@vercel/node"
import R from "ramda"
import { computeAbsoluteVoteWeights } from "../lib/compute-vote-weights"
import { getAllDelegationsTo, getSnapshotSpaces } from "../lib/data"
import { fetchVoteWeights } from "../lib/services/snapshot"
import * as storage from "../lib/services/storage-write"

/**
 * Recomputes the vote weights for all delegations, and stores the results.
 *
 * Triggered by a cron job
 */
export default async function getDelegations(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log("0. Fetch cross contexts (snapshot spaces)")
  const spaces = await getSnapshotSpaces()

  console.log("spaces:", spaces)

  console.log("1. Fetch and merge all delegations across all chains")

  await Promise.all(
    spaces.map(async (space) => {
      console.log("Starting computation for space:", space)
      // 1.1. - get all to delegations
      const delegations = await getAllDelegationsTo(space)
      console.log("delegations:", delegations)
      if (delegations == null) {
        console.log("Done: no delegations found")
        return response.status(200).json({
          body: "ok, no delegations found",
        })
      }

      console.log("2. Get vote weights for all delegators")

      const delegatingAccounts = R.uniq(
        R.flatten(
          Object.values(delegations).map((member) => Object.keys(member)),
        ),
      )
      console.log("delegatingAccounts:", delegatingAccounts)
      const voteWeights = await fetchVoteWeights(space, delegatingAccounts)
      console.log("voteWeights:", voteWeights)

      if (R.keys(voteWeights)?.length === 0) {
        console.log("Done: no vote weights found")
        return "Done: no vote weights found"
      }

      console.log("3. Compute vote weights for all delegations")
      const [delegatedVoteWeight, delegatedVoteWeightByAccount] =
        computeAbsoluteVoteWeights(delegations, voteWeights)

      console.log("delegatedVoteWeightByAccount:", delegatedVoteWeightByAccount)

      console.log("4. Store delegated vote weights")
      return await storage.storeDelegatedVoteWeight(
        space,
        delegatedVoteWeight,
        delegatedVoteWeightByAccount,
      )
    }),
  )

  console.log("Done!")
  response.status(200).json({
    body: "ok",
  })
}
