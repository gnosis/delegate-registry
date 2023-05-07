import {
  getLastUpdateTime,
  getTopDelegatorsForDelegate,
} from "../../../lib/services/storage/read"
import * as R from "ramda"
import { utils } from "ethers"
const { getAddress } = utils

export const config = {
  runtime: "experimental-edge",
}

/**
 * Returns the top delegators (by vote weight) for a given delegate.
 *
 * @example responds:
 *{
 * "delegate": "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905",
 * "delegators": [
 *   [
 *     "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190",
 *     12.53397165446844
 *   ],
 *   [
 *     "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A",
 *     0.006666666666666666
 *   ]
 * ],
 * "updateTime": 1677158495
 *}
 */
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

  const updateTime = await getLastUpdateTime(snapshotSpace)

  return new Response(
    JSON.stringify({ delegate: delegateAddress, delegators, updateTime }),
  )
}
