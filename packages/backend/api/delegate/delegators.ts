import {
  getDelegatedVoteWeight,
  getTopDelegatorsForDelegate,
} from "../../lib/services/storage/read"
import * as R from "ramda"
import { utils } from "ethers"
const { getAddress } = utils

export const config = {
  runtime: "experimental-edge",
}

export default async (req: Request) => {
  const url = new URL(req.url)
  const snapshotSpace = url.searchParams.get("space")
  const delegateAddress = R.tryCatch(
    getAddress,
    R.always(null),
  )(url.searchParams.get("delegateAddress") ?? "")
  const limit = Number(url.searchParams.get("limit"))
  if (snapshotSpace == null) {
    return new Response("Missing `space` parameter (Snapshot space).", {
      status: 400,
    })
  }
  if (delegateAddress == null) {
    return new Response(
      "Requires a valid address for the `delegateAddress` parameters.",
      {
        status: 400,
      },
    )
  }
  const delegators = await getTopDelegatorsForDelegate(
    snapshotSpace,
    delegateAddress,
    isNaN(limit) || limit <= 0 ? 100 : limit,
  )
  if (R.isEmpty(delegators)) {
    console.log(
      "No delegators found for the provided addresses in the specified Snapshot Space: ",
      snapshotSpace,
    )
    return new Response(JSON.stringify([]), { status: 200 })
  }

  return new Response(JSON.stringify(delegators))
}
