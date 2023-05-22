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

  console.log(space)

  const stats = await db
    .selectFrom("delegation_snapshot")
    .where("context", "=", space)
    .where("main_chain_block_number", "is", null)
    .select(["delegated_amount", "to_address_own_amount"])
    .execute()

  console.log(stats.length)
  if (stats.length === 0) {
    console.log("No delegations found for space context", space)
  }

  // const voteWeightDelegated = delegators.reduce(
  //   (acc, { delegated_amount }) => acc.add(BigNumber.from(delegated_amount)),
  //   BigNumber.from(0),
  // )
  // const delegatesOwnVoteWeight = BigNumber.from(
  //   delegators[0]?.to_address_own_amount ?? "0",
  // )

  response.status(200).json({
    success: "true",
    // delegates,
    // voteWeightDelegated: voteWeightDelegated.toString(),
    // numberOfDelegates: delegates.length,
    // delegatesOwnVoteWeight: delegatesOwnVoteWeight.toString(),
    // totalVoteWeight: voteWeightDelegated.add(delegatesOwnVoteWeight).toString(),
  })
}
