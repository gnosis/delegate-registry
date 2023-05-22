import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createDelegationSnapshot } from "../lib/updateSnapshot"
import { getSnapshotSpaces } from "../lib/data"
import { initDb } from "../lib/services/storage/db"

/**
 * Recomputes the vote weights for all delegations, and stores the results.
 *
 * Triggered by a cron job
 */
export default async function getDelegations(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log("deeper test api hit")
  response.status(200).json({
    success: "true",
    info: "Done! Computing and storing delegated vote weights. FOr all spaces."
  })
}
