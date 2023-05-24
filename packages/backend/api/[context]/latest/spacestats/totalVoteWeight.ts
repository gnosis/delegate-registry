// return the total vote weight across all snapshot spaces.

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db, getDelegationSnapshot } from "../../../../lib/services/storage/db"
import { BigNumber, ethers } from "ethers"

export default async function getTotalVoteWeight(
  request: VercelRequest,
  response: VercelResponse,
) {
  const spaces = ["gnosis.eth", "gnosisdaotest.eth"]

  const total = await spaces.reduce(async (acc, space) => {
    const accFirst = await acc
    const stats = await db
      .selectFrom("delegation_snapshot")
      .where("context", "=", space)
      .where("main_chain_block_number", "is", null)
      .select(["delegated_amount", "to_address_own_amount"])
      .execute()

    const spaceTotal = stats.reduce((innerAcc, stat) => {
      return innerAcc.add(BigNumber.from(stat.delegated_amount))
    }, BigNumber.from(0))

    return accFirst.add(spaceTotal)
  }, Promise.resolve(BigNumber.from(0)))

  response.status(200).json({
    success: "true",
    totalSpaceVotingWeight: total.toString()
  })
}
