import { Ratio } from "../../types"

/**
 * Used to compute the vote weight delegated to delegators.
 * This is just what is delegated to a delegate. To get total vote weight for
 * a delegate, add the vote weight for the delegate them self.
 *
 * @param delegationRatios - the delegation ratios for each delegate
 * (delegate -> delegator -> Ratio)
 * @param voteWeights - the vote weight for each delegator
 * (delegator -> vote weight)
 * @returns a tuple of two maps:
 * (delegate -> vote weight) and (delegate -> delegator -> vote weight)
 */
export const computeAbsoluteVoteWeights = (
  delegationRatios: { [delegate: string]: { [delegator: string]: Ratio } },
  voteWeights: { [member: string]: number },
): [
  { [delegate: string]: number },
  { [delegate: string]: { [delegatingAccount: string]: number } },
] => {
  const computeDelegatedVoteWeight = (
    representative: string,
    accumulatedVoteWeights: { [representative: string]: number },
    accumulatedVoteWeightsByAccount: {
      [delegate: string]: { [delegatingAccount: string]: number }
    },
  ): [
    { [address: string]: number },
    { [delegate: string]: { [delegatingAccount: string]: number } },
  ] => {
    if (accumulatedVoteWeights[representative] != null) {
      // Already computed vote weight for this delegatee
      return [accumulatedVoteWeights, accumulatedVoteWeightsByAccount]
    }
    // Depth first
    return Object.keys(delegationRatios[representative]).reduce(
      ([accVoteWeights, accVoteWeightsByAccount], member) => {
        // for each address delegated from to this delegate (`to`)
        const { numerator, denominator } =
          delegationRatios[representative][member]
        const ratio = numerator / denominator
        const delegatorVoteWeight = (voteWeights[member] ?? 0) * ratio

        // add votes delegated to the delegator
        if (delegationRatios[member] != null) {
          // if the delegator has delegated votes
          ;[accVoteWeights, accVoteWeightsByAccount] =
            computeDelegatedVoteWeight(
              member,
              accumulatedVoteWeights,
              accumulatedVoteWeightsByAccount,
            )
        }

        // add delegator's votes + any delegated votes to the delegator
        const delegatedVoteWeightToDelegator =
          (accumulatedVoteWeights[member] ?? 0) * ratio

        accumulatedVoteWeights[representative] =
          (accumulatedVoteWeights[representative] ?? 0) +
          delegatorVoteWeight +
          delegatedVoteWeightToDelegator
        accVoteWeightsByAccount[representative] = {
          ...accVoteWeightsByAccount[representative],
          [member]: delegatorVoteWeight + delegatedVoteWeightToDelegator,
        }
        return [accVoteWeights, accVoteWeightsByAccount]
      },
      [accumulatedVoteWeights, accumulatedVoteWeightsByAccount],
    )
  }

  const resultingVoteWeights: [
    { [delegate: string]: number },
    { [delegate: string]: { [delegatingAccount: string]: number } },
  ] = Object.keys(delegationRatios).reduce(
    // for each address delegated to
    (acc, to) => computeDelegatedVoteWeight(to, ...acc),
    [{}, {}],
  )
  return resultingVoteWeights
}
