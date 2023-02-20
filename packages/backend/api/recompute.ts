import type { VercelRequest, VercelResponse } from "@vercel/node"
import R from "ramda"
import { computeAbsoluteVoteWeights } from "../lib/data-transformers/compute-vote-weights"
import { getAllDelegationsTo, getSnapshotSpaces } from "../lib/data"
import { fetchVoteWeights } from "../lib/services/snapshot"
import * as storage from "../lib/services/storage/write"

export const config = {
  cron: "0 */2 * * *",
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
  const spaces = await getSnapshotSpaces()
  console.log(
    "Found this list of snapshot spaces to compute vite weights from: ",
    spaces,
  )

  await Promise.all(
    spaces.map(async (space) => {
      console.log(`[${space}] Starting computation for space: ${space}`)
      console.log(
        `[${space}] 1. Fetch and merge all delegations across all chains`,
      )
      const delegations = await getAllDelegationsTo(space)
      if (delegations == null) {
        console.log(`[${space}] Done: no delegations found`)
        return response.status(200).json({
          body: "ok, no delegations found",
        })
      }

      const delegatingAccounts = R.uniq(
        R.flatten(
          Object.values(delegations).map((member) => Object.keys(member)),
        ),
      )
      console.log(
        `[${space}] 2. Getting vote weights for ${delegatingAccounts.length} unique delegating addresses.`,
      )
      const voteWeights = await fetchVoteWeights(space, delegatingAccounts)

      if (R.keys(voteWeights)?.length === 0) {
        console.log(`[${space}] Done: no vote weights found.`)
        return `[${space}] Done: no vote weights found`
      }

      console.log(
        `[${space}] 3. Computing vote weights for ${
          R.keys(voteWeights).length
        } delegating addresses with non-zero vote weight.`,
      )
      const [delegatedVoteWeight, delegatedVoteWeightByAccount] =
        computeAbsoluteVoteWeights(delegations, voteWeights)

      console.log(
        `[${space}] 4. Storing delegated vote weight for ${
          Object.keys(delegatedVoteWeight).length
        } delegates.`,
      )
      return await storage.storeDelegatedVoteWeight(
        space,
        delegatedVoteWeight,
        delegatedVoteWeightByAccount,
      )
    }),
  )

  console.log("Done! Computing and storing delegated vote weights.")
  response.status(200).json({
    body: "ok",
  })
}
