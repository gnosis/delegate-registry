import { getTopDelegatesByVoteWeight } from "../../lib/services/storage/read"

export const config = {
  runtime: "experimental-edge",
}

/**
 * Returns the top delegates for a snapshot space.
 *
 * @example responds:
 *[
 * [
 *   "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190",
 *   16.390578317381806
 * ],
 * [
 *   "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905",
 *   12.540638321135106
 * ],
 * [
 *   "0x7ef021f62E3E7975FBC21d3202C5A1F19D53bB47",
 *   3.856606662913366
 * ],
 * [
 *   "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8",
 *   0.003333333333333333
 * ]
 *]
 */

export default async (req: Request) => {
  const url = new URL(req.url)
  const snapshotSpace = url.searchParams.get("space")
  const limit = Number(url.searchParams.get("limit"))
  if (snapshotSpace == null) {
    return new Response("Missing `space` parameter (Snapshot space).", {
      status: 400,
    })
  }

  const topDelegatesByVoteWeight = await getTopDelegatesByVoteWeight(
    snapshotSpace,
    isNaN(limit) || limit <= 0 ? 100 : limit,
  )

  return new Response(JSON.stringify(topDelegatesByVoteWeight))
}
