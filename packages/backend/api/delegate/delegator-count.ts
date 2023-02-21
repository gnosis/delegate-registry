import {
  getDelegatedVoteWeight,
  getNumberOfDelegatorsForDelegate,
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
  const numberOfDelegators = await getNumberOfDelegatorsForDelegate(
    snapshotSpace,
    delegateAddress,
  )

  return new Response(JSON.stringify({ numberOfDelegators }))
}
