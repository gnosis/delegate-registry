import type { VercelRequest, VercelResponse } from "@vercel/node"
import * as R from "ramda"

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log(R.prop("body", request))
  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  })
}
