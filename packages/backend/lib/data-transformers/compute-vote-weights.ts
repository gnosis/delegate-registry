import { DelegateToDelegatorToValue, DelegateToValue, Ratio } from "../../types"

type BrokenEdges = { [from: string]: string } // From -> To
type Visited = { [representative: string]: boolean }

/**
 * Used to compute the vote weight delegated to delegators.
 * This is just what is delegated to a delegate. To get total vote weight for
 * a delegate, add the vote weight for the delegate them self.
 *
 * This also breaks cycles in the delegation graph.
 *
 * This is NP hard!
 *
 * @param delegationRatios - the delegation ratios for each delegate
 * (delegate -> delegator -> Ratio)
 * @param voteWeights - the vote weight for each delegator
 * (delegator -> vote weight)
 * @returns a tuple of two maps:
 * (delegate -> vote weight) and (delegate -> delegator -> vote weight)
 */
export const computeVoteWeights = (
  delegationRatios: DelegateToDelegatorToValue<Ratio>,
  voteWeights: DelegateToValue,
): [DelegateToValue, DelegateToDelegatorToValue, BrokenEdges] => {
  const computeDelegatedVoteWeight = (
    delegate: string,
    topLevelAccVoteWeights: Readonly<DelegateToValue>,
    topLevelAccVoteWeightsByAccount: Readonly<DelegateToDelegatorToValue>,
    brokenEdges: Readonly<BrokenEdges>,
    trace: Readonly<string[]>,
  ): [DelegateToValue, DelegateToDelegatorToValue, BrokenEdges] => {
    if (trace.includes(delegate)) {
      // console.log("WARNING: Cycle detected in delegation graph!")
      const cycleTrace = [...trace, delegate] as string[]
      // console.log(
      //   // obs, we can't really trust the order of keys in an object
      //   "Trace:" + cycleTrace.join(" -> "),
      // )

      const alreadyHandled =
        cycleTrace.find(
          (from, index) =>
            brokenEdges[from] != null &&
            index + 1 < cycleTrace.length &&
            brokenEdges[from] === cycleTrace[index + 1],
        ) != null

      if (!alreadyHandled) {
        throw Error("Cycle detected in delegation graph")
      } else {
        // console.log("Cycle already handled, ignoring")
        // it is safe to return here because if it is visited it is also computed
        // this is where the cycle is cut
        return [
          topLevelAccVoteWeights,
          topLevelAccVoteWeightsByAccount,
          brokenEdges,
        ]
      }
    }
    if (topLevelAccVoteWeights[delegate] != null) {
      // Already computed vote weight for this delegatee
      // we still needs to go over every edge to detect cycles :/

      // will throw if cycle detected
      Object.keys(delegationRatios[delegate]).map((delegator) => {
        if (delegationRatios[delegator] != null) {
          computeDelegatedVoteWeight(
            delegator,
            topLevelAccVoteWeights,
            topLevelAccVoteWeightsByAccount,
            brokenEdges,
            [...trace, delegate],
          )
        }
      })

      return [
        topLevelAccVoteWeights,
        topLevelAccVoteWeightsByAccount,
        brokenEdges,
      ]
    }
    // Depth first
    return Object.keys(delegationRatios[delegate]).reduce(
      ([accVoteWeights, accVoteWeightsByAccount, brokenEdges], delegator) => {
        // for each address delegated from to this delegate (`to`)
        const { numerator, denominator } = delegationRatios[delegate][delegator]
        const ratio = numerator / denominator
        const delegatorVoteWeight = (voteWeights[delegator] ?? 0) * ratio

        // add votes delegated to the delegator
        if (delegationRatios[delegator] != null) {
          // if the delegator has delegated votes
          try {
            ;[accVoteWeights, accVoteWeightsByAccount, brokenEdges] =
              computeDelegatedVoteWeight(
                delegator,
                accVoteWeights,
                accVoteWeightsByAccount,
                brokenEdges,
                [...trace, delegate],
              )
          } catch (e) {
            // This is how we break cycles. The first time we encounter a edge creating
            // a cycle we cut it by only adding the delegator's votes (NOT the votes delegated to the
            // delegator).
            // console.log(
            //   `Delegation from ${delegator} to ${delegate} only adds delegator's votes (NOT votes delegated to the delegator)`,
            // )
            return [
              {
                ...accVoteWeights,
                [delegate]:
                  (accVoteWeights[delegate] ?? 0) + delegatorVoteWeight,
              },
              {
                ...accVoteWeightsByAccount,
                [delegate]: {
                  ...accVoteWeightsByAccount[delegate],
                  [delegator]: delegatorVoteWeight,
                },
              },
              { ...brokenEdges, [delegator]: delegate },
            ]
          }
        }
        // add delegator's votes + any delegated votes to the delegator
        const delegatedVoteWeightToDelegator =
          (accVoteWeights[delegator] ?? 0) * ratio

        return [
          {
            ...accVoteWeights,
            [delegate]:
              (accVoteWeights[delegate] ?? 0) +
              delegatorVoteWeight +
              delegatedVoteWeightToDelegator,
          },
          {
            ...accVoteWeightsByAccount,
            [delegate]: {
              ...accVoteWeightsByAccount[delegate],
              [delegator]: delegatorVoteWeight + delegatedVoteWeightToDelegator,
            },
          },
          brokenEdges,
        ]
      },
      [topLevelAccVoteWeights, topLevelAccVoteWeightsByAccount, brokenEdges],
    )
  }

  const resultingVoteWeights = Object.keys(delegationRatios).reduce(
    (
      [delegateToVoteWeight, delegateToDelegatorToVoteWeight, brokenEdges],
      delegate,
    ) => {
      if (delegateToVoteWeight[delegate] == null) {
        // this delegate has not been computed yet
        return computeDelegatedVoteWeight(
          delegate,
          delegateToVoteWeight,
          delegateToDelegatorToVoteWeight,
          brokenEdges,
          [], // we are starting from a new delegate, so no visited
        )
      }
      return [
        delegateToVoteWeight,
        delegateToDelegatorToVoteWeight,
        brokenEdges,
      ]
    },
    [{}, {}, {}],
  )

  return resultingVoteWeights as [
    DelegateToValue,
    DelegateToDelegatorToValue,
    BrokenEdges,
  ]
}
