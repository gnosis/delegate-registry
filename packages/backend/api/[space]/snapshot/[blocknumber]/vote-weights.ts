// given a list of addresses, fetch the vote weight for each address from the snapshot in the database

import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function getDelegations(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.status(500).json({
    success: "false",
    info: "not implimented",
  })
}
