// update the snapshot table in the database with the latest data from the subgraph for the given context
// save the data in the snapshot table in the database with blocknumber null
// similar to the old recompute

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createDelegationSnapshot } from "../../../lib/updateSnapshot"
import { initDb } from "../../../lib/services/storage/db"
import { handleCors } from "../../../lib/corsHandler"

/**
 * Recomputes the vote weights for all delegations, and stores the results.
 *
 * Triggered by a cron job
 */
export default async function updateDelegationSnapshot(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (handleCors(request, response)) return
  await initDb()
  const spaceName = request.query.space as string

  console.log({ spaceName })

  console.log(
    "Computing and storing delegated vote weights for space:",
    spaceName,
  )

  await createDelegationSnapshot({ spaceName })

  console.log("Done! Computing and storing delegated vote weights.")
  response.status(200).json({
    success: "true",
    info: "Done! Computing and storing delegated vote weights.",
    space: spaceName,
  })
}
