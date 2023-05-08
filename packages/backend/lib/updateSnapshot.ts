import R from "ramda"
import { computeVoteWeights } from "./data-transformers/compute-vote-weights"
import { getDelegationRatioMap } from "./data"
import { fetchVoteWeights } from "./services/snapshot"
import {
  convertDelegatedVoteWeight,
  convertDelegatedVoteWeightByAccount,
} from "./data-transformers/scale-and-remove-empty"
import * as db from "./services/storage/db"

/**
 * Recomputes the vote weights for all delegations, and stores the results.
 *
 * Triggered by a cron job
 */
export const createDelegationSnapshot = async (
  space: string,
  blocknumber?: number,
) => {
  console.log("Updating the latest snapshot for the following space:", space)

  console.log(`[${space}] Starting computation for space: ${space}`)

  console.log(`[${space}] 1. Fetch and merge all delegations across all chains`)

  const delegations = await getDelegationRatioMap(space)
  if (delegations == null) {
    console.log(`[${space}] Done: no delegations found`)
    return await db.emptyLatestSnapshot(space)
  }

  const accountsRequiringVoteWeight = R.uniq(
    R.flatten(
      Object.entries(delegations).map(([delegate, member]) => [
        ...Object.keys(member),
        delegate,
      ]),
    ),
  )
  console.log(
    `[${space}] 2. Getting vote weights for ${accountsRequiringVoteWeight.length} unique delegating addresses.`,
  )
  const voteWeights = await fetchVoteWeights(space, accountsRequiringVoteWeight)

  if (R.keys(voteWeights)?.length === 0) {
    console.log(`[${space}] Done: no vote weights found.`)
    return await db.emptyLatestSnapshot(space)
  }

  console.log(
    `[${space}] 3. Computing vote weights for ${
      R.keys(voteWeights).length
    } delegating addresses with non-zero vote weight.`,
  )
  const [delegatedVoteWeight, delegatedVoteWeightByAccount] =
    computeVoteWeights(delegations, voteWeights)

  console.log(
    `[${space}] 4. Storing delegated vote weight for ${
      Object.keys(delegatedVoteWeight).length
    } delegates.`,
  )

  // const delegatedVoteWeightScaled =
  //   convertDelegatedVoteWeight(delegatedVoteWeight)

  const delegatedVoteWeightByAccountScaled =
    convertDelegatedVoteWeightByAccount(delegatedVoteWeightByAccount)

  console.log(
    "delegatedVoteWeightByAccountScaled",
    delegatedVoteWeightByAccountScaled,
  )

  // TODO: optimize this by doing it in one of the previous steps (loops)
  const snapshot: db.DelegationSnapshot[] = Object.entries(
    delegatedVoteWeightByAccountScaled,
  ).reduce((acc, [delegate, delegators]) => {
    Object.entries(delegators).forEach(([delegator, voteWeight]) => {
      const to_address_own_amount =
        voteWeights[delegate] == null
          ? "0"
          : voteWeights[delegate].toFixed(18).replace(".", "")
      acc.push({
        context: space,
        main_chain_block_number: null,
        from_address: delegator,
        to_address: delegate,
        delegated_amount: voteWeight,
        to_address_own_amount,
      })
    })
    return acc
  }, [] as db.DelegationSnapshot[])

  console.log("snapshot", snapshot)

  return await db.storeSnapshot(snapshot)
}
