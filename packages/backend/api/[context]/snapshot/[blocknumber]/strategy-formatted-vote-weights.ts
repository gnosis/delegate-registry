// given a list of addresses, fetch the vote weight for each address from the snapshot in the database
// will be used by the strategy to calculate the score

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createDelegationSnapshot } from "../../../../lib/updateSnapshot"
import {
  checkIfSnapshotExists,
  getDelegationSnapshot,
  getVoteWeightSnapshot,
} from "../../../../lib/services/storage/db"
import * as R from "ramda"
import { BigNumber } from "ethers"

export default async function getVoteWeightsForSnapshot(
  request: VercelRequest,
  response: VercelResponse,
) {
  const context = request.query.context as string
  const mainChainBlockNumber: number | null =
    request.query.blocknumber === "latest"
      ? null
      : Number(request.query.blocknumber)

  const addresses = request.body.addresses as string[]

  console.log({
    context,
    mainChainBlockNumber,
    addresses,
  })

  if (mainChainBlockNumber != null) {
    if (!(await checkIfSnapshotExists(context, mainChainBlockNumber))) {
      await createDelegationSnapshot(context, mainChainBlockNumber)
    }
  }

  const voteWeights = await getVoteWeightSnapshot(context, mainChainBlockNumber)
  console.log({ voteWeights })

  const relevantVoteWeights = R.innerJoin(
    (record, address) => record.to_address === address,
    voteWeights,
    addresses,
  )

  response
    .status(200)
    .json(
      relevantVoteWeights.map((record) => [
        record.to_address,
        BigNumber.from(record.delegated_amount)
          .add(BigNumber.from(record.to_address_own_amount))
          .toString(),
      ]),
    )
}
