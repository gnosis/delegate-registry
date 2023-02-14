import { Ratio } from "./services/the-graph"

/**
 * The vote weight delegated to a delegatee.
 * To get total vote weight for a delegatee, add the vote weight for the delegatee them self.
 * This is just what is delegated to them.
 *
 * @param delegationRatios
 * @param voteWeights
 * @returns
 */
export const computeDelegatedVoteWeights = (
  delegationRatios: { [representative: string]: { [member: string]: Ratio } },
  voteWeights: { [member: string]: number },
) => {
  const computeDelegatedVoteWeight = (
    representative: string,
    accumulatedVoteWeights: { [representative: string]: number },
  ): { [address: string]: number } => {
    if (accumulatedVoteWeights[representative] != null) {
      // Already computed vote weight for this delegatee
      return accumulatedVoteWeights
    }
    // Depth first
    return Object.keys(delegationRatios[representative]).reduce(
      (acc, member) => {
        // for each address delegated from to this delegate (`to`)
        const { numerator, denominator } =
          delegationRatios[representative][member]
        const ratio = numerator / denominator
        const delegatorVoteWeight = (voteWeights[member] ?? 0) * ratio

        // add votes delegated to the delegator
        if (delegationRatios[member] != null) {
          // if the delegator has delegated votes
          acc = computeDelegatedVoteWeight(member, acc)
        }

        // add delegator's votes + any delegated votes to the delegator
        const delegatedVoteWeightToDelegator = (acc[member] ?? 0) * ratio

        acc[representative] =
          (acc[representative] ?? 0) +
          delegatorVoteWeight +
          delegatedVoteWeightToDelegator
        return acc
      },
      accumulatedVoteWeights,
    )
  }

  const voteWeightDelegatedTo: { [address: string]: number } = Object.keys(
    delegationRatios,
  ).reduce(
    // for each address delegated to
    (acc, to) => computeDelegatedVoteWeight(to, acc),
    {},
  )
  return voteWeightDelegatedTo
}
