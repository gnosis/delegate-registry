// return global stats for a given snapshot space.

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db, getDelegationSnapshot } from "../../../../lib/services/storage/db"
import { BigNumber, ethers } from "ethers"

export default async function getSpaceStats(
  request: VercelRequest,
  response: VercelResponse,
) {
  const context = request.query.context as string
  const space = request.query.space as string

  const stats = await db
    .selectFrom("delegation_snapshot")
    .where("context", "=", space)
    .where("main_chain_block_number", "is", null)
    .select(["from_address", "delegated_amount", "to_address_own_amount"])
    .execute()

  // const stats2 = await db
  //   .selectFrom("delegation_snapshot")
  //   .where("context", "=", space)
  //   .where("main_chain_block_number", "is", null)
  //   .execute()

  // console.log(stats2.length)

  if (stats.length === 0) {
    console.log("No delegations found for space context", space)
  }

  // total unique delegations TODO: find select distinct in kinsly
  const unique = [...new Set(stats.map(item => item.from_address))];
  // total delegated vote weight
  // total non-unique delegations
  const globalStats = stats.reduce((acc, stat) => {
      acc.totalVoteWeight = acc.totalVoteWeight.add(BigNumber.from(stat.delegated_amount))
      acc.totalDelegations++
      return acc
  }, { totalVoteWeight:BigNumber.from(0), totalDelegations:0 })

  response.status(200).json({
    success: "true",
    totalVoteWeight: globalStats.totalVoteWeight.toString(),
    totalDelegations: globalStats.totalDelegations,
    totalUniqueDelegators: unique.length
  })
}
