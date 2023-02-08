import type { VercelRequest, VercelResponse } from "@vercel/node"
import { computeDelegatedVoteWeights } from "../lib/compute-vote-weights"
import { getVoteWeights } from "../lib/services/snapshot-api"

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
  const delegation = [
    {
      from: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
      to: "0xeF8305E140ac520225DAf050e2f71d5fBcC543e7",
      ratio: 0.5,
    },
    {
      from: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
      to: "0x1E1A51E25f2816335cA436D65e9Af7694BE232ad",
      ratio: 0.5,
    },
    {
      from: "0x1E1A51E25f2816335cA436D65e9Af7694BE232ad",
      to: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb22",
      ratio: 0.5,
    },
    {
      from: "0x1E1A51E25f2816335cA436D65e9Af7694BE232ad",
      to: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb33",
      ratio: 0.5,
    },
  ]

  console.log("2. Get vote weights for all delegators")
  const delegators = delegation.map((delegation) => delegation.from)
  const voteWeights = await getVoteWeights(delegators)

  console.log("3. Compute vote weights for all delegations")
  const delegationRatios = delegation.reduce((acc, delegation) => {
    acc[delegation.to] = {
      ...acc[delegation.to],
      [delegation.from]: delegation.ratio,
    }
    return acc
  }, {} as Record<string, Record<string, number>>)

  const delegatedVoteWeight = computeDelegatedVoteWeights(
    delegationRatios,
    voteWeights,
  )

  console.log("4. store vote weights")

  response.status(200).json({
    body: "ok",
  })
}
