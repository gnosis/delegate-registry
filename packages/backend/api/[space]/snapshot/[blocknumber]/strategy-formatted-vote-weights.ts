// given a list of addresses, fetch the vote weight for each address from the snapshot in the database
// will be used by the strategy to calculate the score

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createDelegationSnapshot } from "../../../../lib/updateSnapshot"
import {
  checkIfSnapshotExists,
  getVoteWeightSnapshot,
} from "../../../../lib/services/storage/db"
import * as R from "ramda"
import { BigNumber } from "ethers"
import { SnapshotStrategy } from "../../../../lib/services/snapshot"

export default async function getVoteWeightsForSnapshot(
  request: VercelRequest,
  response: VercelResponse,
) {
  const context = request.query.space as string
  const mainChainBlockNumber: number | null =
    request.query.blocknumber === "latest"
      ? null
      : Number(request.query.blocknumber)

  const addresses = request.body.addresses as string[]
  const strategies = request.body.strategies as SnapshotStrategy[]

  console.log({
    context,
    mainChainBlockNumber,
    addresses,
    strategies,
  })

  if (mainChainBlockNumber != null) {
    if (!(await checkIfSnapshotExists(context, mainChainBlockNumber))) {
      await createDelegationSnapshot(context, mainChainBlockNumber, strategies)
    }
  }

  // All addresses that have delegated or are delegated to are present in the snapshot
  const voteWeights = await getVoteWeightSnapshot(context, mainChainBlockNumber)
  // console.log({ voteWeights })

  const relevantVoteWeights = R.innerJoin(
    (record, address) => record.to_address === address,
    voteWeights,
    addresses,
  )

  // Addresses that are not returned, have not delegated or and are not delegated to
  // Addresses that are delegating has a vote weight of 0
  response
    .status(200)
    .json(
      relevantVoteWeights.map((record) => [
        record.to_address,
        record.delegated_to_count !== "0"
          ? "0"
          : BigNumber.from(record.delegated_amount).toString(),
      ]),
    )
}
