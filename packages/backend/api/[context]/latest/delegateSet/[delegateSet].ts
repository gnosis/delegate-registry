// return all of the delegated addresses that a specific delegator address is delegating to and the amount delegated for each delegate per delegator.

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db } from "../../../../lib/services/storage/db"
import { BigNumber, ethers } from "ethers"

export default async function getDelegationSet(
  request: VercelRequest,
  response: VercelResponse,
) {
  const context = request.query.context as string
  const delegatorAddress = ethers.utils.getAddress(
    request.query.delegatorAddress as string,
  )
  console.log("context", context)
  console.log("delegatorAddress", delegatorAddress)
  const delegates = await db
    .selectFrom("delegation_snapshot")
    .where("context", "=", context)
    .where("main_chain_block_number", "is", null)
    .where("to_address", "=", delegateAddress)
    .select(["from_address", "delegated_amount", "to_address_own_amount"])
    .execute()

  if (delegates.length === 0) {
    console.log("No delegates found for delegatorAddress", delegatorAddress)
  }

  const voteWeightDelegated = delegators.reduce(
    (acc, { delegated_amount }) => acc.add(BigNumber.from(delegated_amount)),
    BigNumber.from(0),
  )
  const delegatesOwnVoteWeight = BigNumber.from(
    delegators[0]?.to_address_own_amount ?? "0",
  )

  response.status(200).json({
    delegators,
    voteWeightDelegated: voteWeightDelegated.toString(),
    numberOfDelegators: delegators.length,
    delegatesOwnVoteWeight: delegatesOwnVoteWeight.toString(),
    totalVoteWeight: voteWeightDelegated.add(delegatesOwnVoteWeight).toString(),
  })
}
