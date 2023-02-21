import { getTopDelegatesByVoteWeight } from "../../lib/services/storage/read"

export const config = {
  runtime: "experimental-edge",
}

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
