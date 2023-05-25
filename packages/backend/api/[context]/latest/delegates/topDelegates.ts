import * as R from "ramda"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db, getDelegationSnapshot } from "../../../../lib/services/storage/db"
import { BigNumber, ethers } from "ethers"

export default async function getTopDelegates(
  request: VercelRequest,
  response: VercelResponse,
) {
  // const context = request.query.context as string
  const space = request.query.space as string
  const block = 8979657

  const stats = await db
    .selectFrom("delegation_snapshot")
    .where("context", "=", space)
    .where("main_chain_block_number", "=", block)
    .select(["to_address"])
    .execute()

  if (stats.length === 0) {
    console.log("No delegations found for space context", space)
  }

  console.log(stats)
  const finalArray = stats.map(function (obj) {
	  return obj.to_address;
	});
  console.log(finalArray)
  const test = R.countBy(R.toLower)(finalArray)
  console.log(test)

  response.status(200).json({
    success: "true",
  })
}
