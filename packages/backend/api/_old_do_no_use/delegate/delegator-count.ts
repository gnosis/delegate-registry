import {
  getLastUpdateTime,
  getNumberOfDelegatorsForDelegate,
} from "../../lib/services/storage/read"
import * as R from "ramda"
import { utils } from "ethers"
const { getAddress } = utils

export const config = {
  runtime: "experimental-edge",
}

/**
 * Returns the number of delegators for a given delegate.
 *
 * @example responds:
 * {
 *  "delegate": "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905",
 *  "numberOfDelegators": 1,
 *  "updateTime": 1677158495
 * }
 */

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

  const updateTime = await getLastUpdateTime(snapshotSpace)

  return new Response(
    JSON.stringify({
      delegate: delegateAddress,
      numberOfDelegators,
      updateTime,
    }),
  )
}
