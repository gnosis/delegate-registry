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
  // const uniqueDelegations = stats.filter({ from_address }, )
  // total delegated vote weight
  const globalStats = stats.reduce((acc, stat) => {
      //acc.add(BigNumber.from(delegated_amount))
      acc.totalVoteWeight = acc.totalVoteWeight.add(BigNumber.from(stat.delegated_amount))
      acc.someData = true
      console.log(stat)
      return acc
  }, {totalVoteWeight:BigNumber.from(0), someData:false})

  console.log(globalStats.totalVoteWeight.toString())

  response.status(200).json({
    success: "true",
    // delegates,
    // voteWeightDelegated: voteWeightDelegated.toString(),
    // numberOfDelegates: delegates.length,
    // delegatesOwnVoteWeight: delegatesOwnVoteWeight.toString(),
    // totalVoteWeight: voteWeightDelegated.add(delegatesOwnVoteWeight).toString(),
  })
}
