// return the address's delegating to this delegateAddress, and their vote weight
// from the snapshot table in the database (where the snapshot was created
// for the given context and blocknumber is null)

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db } from "../../../../lib/services/storage/db"
import { BigNumber, ethers } from "ethers"

export default async function getDelegations(
  request: VercelRequest,
  response: VercelResponse,
) {
  const space = request.query.space as string
  const delegateAddress = ethers.utils.getAddress(
    request.query.delegateAddress as string,
  )
  console.log("space", space)
  console.log("delegateAddress", delegateAddress)
  const delegators = await db
    .selectFrom("delegation_snapshot")
    .where("context", "=", space)
    .where("main_chain_block_number", "is", null)
    .where("to_address", "=", delegateAddress)
    .select(["from_address", "delegated_amount", "to_address_own_amount"])
    .execute()

  if (delegators.length === 0) {
    console.log("No delegators found for delegateAddress", delegateAddress)
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
