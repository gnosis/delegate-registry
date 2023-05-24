// return global stats for a given snapshot space.

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db, getDelegationSnapshot } from "../../../../lib/services/storage/db"
import { BigNumber, ethers } from "ethers"

export default async function totalDelegators(
  request: VercelRequest,
  response: VercelResponse,
) {
  const context = request.query.context as string
  const space = request.query.space as string

  const stats = await db
    .selectFrom("delegation_snapshot")
    .where("context", "=", space)
    .where("main_chain_block_number", "is", null)
    .select(["from_address"])
    .distinct()
    .execute()

  if (stats.length === 0) {
    console.log("No delegations found for space context", space)
  }

  console.log(stats)
  response.status(200).json({
    success: "true",
    totalUniqueDelegators: stats.length
  })
}
