/**
 * The vote weight delegated to a delegatee.
 * To get total vote weight for the delegatee, add the vote weight for the delegatee them self.
 * This is just what is delegated to them.
 *
 * @param delegationRatios
 * @param votes
 * @returns
 */
export const computeDelegatedVoteWeights = (
  delegationRatios: { [to: string]: { [from: string]: number } },
  votes: { [address: string]: number },
) => {
  const computeDelegatedVoteWeight = (
    to: string,
    accumulatedVoteWeights: { [address: string]: number },
  ): { [address: string]: number } => {
    if (accumulatedVoteWeights[to] != null) {
      // Already computed vote weight for this delegatee
      return accumulatedVoteWeights
    }
    return Object.keys(delegationRatios[to]).reduce((acc, from) => {
      // for each address delegated from to this delegate (`to`)
      const ration = delegationRatios[to][from]
      const delegatorVotes = votes[from] * ration

      // add votes delegated to the delegator
      if (delegationRatios[from] != null) {
        // if the delegator has delegated votes
        acc = computeDelegatedVoteWeight(from, acc)
      }

      // add delegator's votes + any delegated votes to the delegator
      acc[to] = (acc[to] ?? 0) + delegatorVotes + (acc[from] ?? 0) * ration
      return acc
    }, accumulatedVoteWeights)
  }

  const voteDelegatedTo: { [address: string]: number } = Object.keys(
    delegationRatios,
  ).reduce(
    // for each address delegated to
    (acc, to) => computeDelegatedVoteWeight(to, acc),
    {} as { [address: string]: number },
  )
  return voteDelegatedTo
}
