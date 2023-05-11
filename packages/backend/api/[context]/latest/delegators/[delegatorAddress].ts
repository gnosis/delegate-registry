// return a delegators delegation set from the graph

import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function getDelegations(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.status(200).json({})
}
