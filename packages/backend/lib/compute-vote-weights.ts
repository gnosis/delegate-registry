import { Ratio } from "./data"

/**
 * The vote weight delegated to a delegatee.
 * To get total vote weight for a delegatee, add the vote weight for the delegatee them self.
 * This is just what is delegated to them.
 *
 * @param delegationRatios
 * @param voteWeights
 * @returns
 */
export const computeAbsoluteVoteWeights = (
  delegationRatios: { [representative: string]: { [member: string]: Ratio } },
  voteWeights: { [member: string]: number },
): [
  { [delegate: string]: number },
  { [delegate: string]: { [delegatingAccount: string]: number } },
] => {
  console.log("computeDelegatedVoteWeights")
  console.log("delegationRatios:", delegationRatios)
  console.log("voteWeights:", voteWeights)
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

        console.log(ratio)
        console.log(delegatorVoteWeight)

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

        console.log(
          "delegatedVoteWeightToDelegator:",
          delegatedVoteWeightToDelegator,
        )

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
