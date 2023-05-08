// update the snapshot table in the database with the latest data from the subgraph for the given context
// save the data in the snapshot table in the database with blocknumber null
// similar to the old recompute

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createDelegationSnapshot } from "../../../lib/updateSnapshot"
import { initDb } from "../../../lib/services/storage/db"

/**
 * Recomputes the vote weights for all delegations, and stores the results.
 *
 * Triggered by a cron job
 */
export default async function updateDelegationSnapshot(
  request: VercelRequest,
  response: VercelResponse,
) {
  await initDb()
  const space = request.query.context as string

  await createDelegationSnapshot(space)

  console.log("Done! Computing and storing delegated vote weights.")
  response.status(200).json({
    success: "true",
    info: "Done! Computing and storing delegated vote weights.",
    space,
  })
}
