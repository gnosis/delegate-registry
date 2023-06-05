// return all of the delegated addresses that a specific delegator address is delegating to and the amount delegated for each delegate per delegator.

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db, getDelegationSnapshot } from "../../../../lib/services/storage/db"
import { BigNumber, ethers } from "ethers"

export default async function getDelegationSet(
  request: VercelRequest,
  response: VercelResponse,
) {
  const context = request.query.context as string
  const space = request.query.space as string
  const delegatorAddress = ethers.utils.getAddress(
    request.query.delegatorAddress as string,
  )

  const delegates = await db
    .selectFrom("delegation_snapshot")
    .where("context", "=", space)
    .where("main_chain_block_number", "is", null)
    .where("from_address", "=", delegatorAddress)
    .select(["to_address", "delegated_amount", "to_address_own_amount"])
    .execute()

  if (delegates.length === 0) {
    console.log("No delegates found for delegatorAddress", delegatorAddress)
  }

  response.status(200).json({
    success: "true",
    delegates,
    numberOfDelegates: delegates.length
  })
}
