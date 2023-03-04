import type { VercelRequest, VercelResponse } from "@vercel/node"
import R from "ramda"
import { computeVoteWeights } from "../lib/data-transformers/compute-vote-weights"
import { getDelegationRatioMap, getSnapshotSpaces } from "../lib/data"
import { fetchVoteWeights } from "../lib/services/snapshot"
import * as storage from "../lib/services/storage/write"
import { ethers } from "ethers"
import { DelegateToDelegatorToVoteWeight } from "../types"

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
      const delegations = await getDelegationRatioMap(space)
      if (delegations == null) {
        console.log(`[${space}] Done: no delegations found`)
        return await storage.storeDelegatedVoteWeight(space, {}, {})
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
        return await storage.storeDelegatedVoteWeight(space, {}, {})
      }

      console.log(
        `[${space}] 3. Computing vote weights for ${
          R.keys(voteWeights).length
        } delegating addresses with non-zero vote weight.`,
      )
      const [delegatedVoteWeight, delegatedVoteWeightByAccount] =
        computeVoteWeights(delegations, voteWeights)

      console.log(
        `[${space}] 4. Storing delegated vote weight for ${
          Object.keys(delegatedVoteWeight).length
        } delegates.`,
      )

      // Remove delegations with 0 vote weight and convert values to BigNumber (18 decimals)
      const delegatedVoteWeightScaled: { [delegate: string]: string } = R.map(
        (value: number) => value.toFixed(18).replace(".", ""),
        R.pickBy((val: number) => val > 0, delegatedVoteWeight ?? {}),
      )
      console.log("delegatedVoteWeight")
      console.log(delegatedVoteWeight)
      console.log("delegatedVoteWeightScaled")
      console.log(delegatedVoteWeightScaled)

      const delegatedVoteWeightByAccountScaled: {
        [delegate: string]: {
          [delegatorAddress: string]: string
        }
      } = R.compose(
        R.pickBy(
          (delegate: { [delegatorAddress: string]: number }) =>
            R.keys(delegate).length > 0, // if delegate has delegators we keep it
        ),
        R.map((delegate: { [delegatorAddress: string]: number }) =>
          // for each delegate
          R.compose(
            R.map((value: number) => value.toFixed(18).replace(".", "")),
            // for each delegator
            R.pickBy((val: number) => val > 0),
          )(delegate),
        ),
      )((delegatedVoteWeightByAccount ?? {}) as any)

      console.log("delegatedVoteWeightByAccount:")
      console.log(delegatedVoteWeightByAccount)
      console.log("delegatedVoteWeightByAccountScaled:")
      console.log(delegatedVoteWeightByAccountScaled)

      return await storage.storeDelegatedVoteWeight(
        space,
        delegatedVoteWeightScaled,
        delegatedVoteWeightByAccountScaled,
      )
    }),
  )

  console.log("Done! Computing and storing delegated vote weights.")
  response.status(200).json({
    success: "true",
    info: "Done! Computing and storing delegated vote weights.",
    spaces: spaces,
  })
}
