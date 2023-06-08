// create a snapshot for a given blocknumber
// get the delegation set for the blocknumber via specifying blocknumber in the query to the subgraphs
// must figure out how to find the correct blocknumber for the subgraphs that are not the main chain
// must use the timestamp of the block on the main chain to figure out correct blocknumber for other chains

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createDelegationSnapshot } from "../../../../lib/updateSnapshot"
import { checkIfSnapshotExists } from "../../../../lib/services/storage/db"

export default async function getDelegations(
  request: VercelRequest,
  response: VercelResponse,
) {
  const context = request.query.space as string
  const mainChainBlockNumber = Number(request.query.blocknumber as string)

  if (await checkIfSnapshotExists(context, mainChainBlockNumber)) {
    console.log(
      `Snapshot already exists. For context: ${context} at blocknumber: ${mainChainBlockNumber}`,
    )
  } else {
    await createDelegationSnapshot(context, mainChainBlockNumber)

    console.log(
      `Done! Computing and storing snapshot of delegated vote weights. For context: ${context} at blocknumber: ${mainChainBlockNumber}`,
    )
  }

  response.status(200).json({
    success: "true",
    info:
      "Done! Computing and storing delegated vote weights. For space: " +
      context,
    spaces: context,
  })
}
