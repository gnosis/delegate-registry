import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createDelegationSnapshot } from "../lib/updateSnapshot"
import { getSnapshotSpaces } from "../lib/data"
import { initDb } from "../lib/services/storage/db"

/**
 * Recomputes the vote weights for all delegations, and stores the results.
 *
 * Triggered by a cron job
 */
export default async function updateDelegations(
  request: VercelRequest,
  response: VercelResponse,
) {
  const startTime = Date.now()
  await initDb()
  const spaces = await getSnapshotSpaces()

  await Promise.all(
    spaces.map((spaceName) => createDelegationSnapshot({ spaceName })),
  )

  console.log(
    "Done! Computing and storing delegated vote weights. For (all) spaces:",
    spaces,
  )

  const fisnsihTime = Date.now()
  console.log(`Execution time: ${(fisnsihTime - startTime) / 1000} seconds`)

  response.status(200).json({
    success: "true",
    info: "Done! Computing and storing delegated vote weights. For all spaces.",
    spaces: spaces,
  })
}
