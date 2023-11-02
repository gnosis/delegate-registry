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
import { DelegateRegistryStrategyParams } from "../../../../lib/services/snapshot"
import { initDb } from "../../../../lib/services/storage/db"

export default async function getVoteWeightsForSnapshot(
  request: VercelRequest,
  response: VercelResponse,
) {
  await initDb()
  const context = request.query.space as string
  const mainChainBlocknumber: number | null =
    request.query.blocknumber === "latest"
      ? null
      : Number(request.query.blocknumber)

  const addresses = request.body.addresses as string[]
  const delegateRegistryParams = request.body
    .spaceParams as DelegateRegistryStrategyParams

  console.log({
    context,
    mainChainBlockNumber: mainChainBlocknumber,
    addresses,
    delegateRegistryParams,
  })

  if (mainChainBlocknumber != null) {
    if (
      await checkIfSnapshotExists(
        mainChainBlocknumber,
        context,
        delegateRegistryParams,
      )
    ) {
      console.log(
        "Snapshot already exists in the database. Skipping snapshot creation.",
      )
    } else {
      await createDelegationSnapshot({
        spaceName: context,
        mainChainBlocknumber,
        delegateRegistryParamsIn: delegateRegistryParams,
      })
    }
  }

  // All addresses that have delegated or are delegated to are present in the snapshot
  const voteWeights = await getVoteWeightSnapshot(context, mainChainBlocknumber)
  // console.log({ voteWeights })

  const relevantVoteWeights = R.innerJoin(
    (record, address) => record.to_address === address,
    voteWeights,
    addresses,
  )

  const missingAddresses = R.difference(
    addresses,
    relevantVoteWeights.map((record) => record.to_address),
  )

  // console.log("Missing addresses", missingAddresses)

  // Addresses that are not returned, have not delegated or and are not delegated to
  // Addresses that are delegating has a vote weight of 0
  console.log("Returning vote weights for addresses:", addresses)
  response
    .status(200)
    .json([
      ...relevantVoteWeights.map((record) => [
        record.to_address,
        record.delegated_to_count !== "0"
          ? "0"
          : BigNumber.from(record.delegated_amount).toString(),
      ]),
      ...missingAddresses.map((address) => [address, "0"]),
    ])
}
