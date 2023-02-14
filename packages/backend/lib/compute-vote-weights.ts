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
  delegationRatios: { [representative: string]: { [member: string]: number } },
  voteWeights: { [address: string]: number },
) => {
  const computeDelegatedVoteWeight = (
    to: string,
    accumulatedVoteWeights: { [address: string]: number },
  ): { [address: string]: number } => {
    if (accumulatedVoteWeights[to] != null) {
      // Already computed vote weight for this delegatee
      return accumulatedVoteWeights
    }
    // Depth first
    return Object.keys(delegationRatios[to]).reduce((acc, from) => {
      // for each address delegated from to this delegate (`to`)
      const ration = delegationRatios[to][from]
      const delegatorVoteWeight = (voteWeights[from] ?? 0) * ration

      // add votes delegated to the delegator
      if (delegationRatios[from] != null) {
        // if the delegator has delegated votes
        acc = computeDelegatedVoteWeight(from, acc)
      }

      // add delegator's votes + any delegated votes to the delegator
      const delegatedVoteWeightToDelegator = (acc[from] ?? 0) * ration

      acc[to] =
        (acc[to] ?? 0) + delegatorVoteWeight + delegatedVoteWeightToDelegator
      return acc
    }, accumulatedVoteWeights)
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
