// retun top delegates for a given snapshot space.
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db } from "../../../../lib/services/storage/db"

const { count, sum } = db.fn

export default async function getTopDelegates(
  request: VercelRequest,
  response: VercelResponse,
) {
  const space = request.query.space as string
  const by: "count" | "weight" =
    request.query.by === "weight" ? "weight" : "count"

  const limit = Number(request.query.limit) || 100

  let topDelegates
  if (by === "count") {
    topDelegates = await db
      .selectFrom("delegation_snapshot")
      .where("context", "=", space)
      .where("main_chain_block_number", "is", null)
      .groupBy("to_address")
      .select(["to_address", count("to_address").as("number_of_delegations")])
      .orderBy("number_of_delegations", "desc")
      .limit(limit)
      .execute()
  } else if (by === "weight") {
    topDelegates = await db
      .selectFrom("delegation_snapshot")
      .where("context", "=", space)
      .where("main_chain_block_number", "is", null)
      .groupBy("to_address")
      .select(["to_address", sum("delegated_amount").as("delegated_amount")])
      .orderBy("delegated_amount", "desc")
      .limit(limit)
      .execute()
  } else {
    throw new Error("Error: invalid 'by' parameter.")
  }

  if (topDelegates.length === 0) {
    console.log("No delegations found for space context", space)
  }

  response.status(200).json({
    success: "true",
    topDelegates,
  })
}
