import R from "ramda"
import {
  DelegateToDelegatorToRatio,
  DelegateToDelegatorToVoteWeight,
  DelegateToVoteWeight,
  Ratio,
} from "../../types"

type BrokenEdges = { [from: string]: string }
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
  delegationRatios: DelegateToDelegatorToRatio,
  voteWeights: DelegateToVoteWeight,
): [DelegateToVoteWeight, DelegateToDelegatorToVoteWeight, BrokenEdges] => {
  const computeDelegatedVoteWeight = (
    representative: string,
    accumulatedVoteWeights: DelegateToVoteWeight,
    accumulatedVoteWeightsByAccount: DelegateToDelegatorToVoteWeight,
    visited: Visited,
    brokenEdges: BrokenEdges,
  ): [DelegateToVoteWeight, DelegateToDelegatorToVoteWeight, BrokenEdges] => {
    if (visited[representative]) {
      console.log("WARNING: Cycle detected in delegation graph!")
      const cycle: string[] = [
        ...R.keys(visited),
        representative,
      ].reverse() as string[]
      console.log(
        // obs, we can't really trust the order of keys in an object
        "Cycle:" + cycle.join(" -> "),
      )

      const mapIndexed = R.addIndex<string, boolean>(R.map)
      const alreadyHandled = R.includes(
        true,
        mapIndexed(
          (val, idx) =>
            brokenEdges[val] != null &&
            idx - 1 < cycle.length &&
            brokenEdges[val] === cycle[idx + 1],
          cycle,
        ),
      )

      if (!alreadyHandled) {
        throw Error("Cycle detected in delegation graph")
      } else {
        console.log("Cycle already handled, ignoring")
        return [
          accumulatedVoteWeights,
          accumulatedVoteWeightsByAccount,
          brokenEdges,
        ]
      }
    }
    if (accumulatedVoteWeights[representative] != null) {
      // Already computed vote weight for this delegatee
      // we still needs to go over every edge to detect cycles :/

      // will throw if cycle detected
      Object.keys(delegationRatios[representative]).map((member) => {
        // if this member has delegated votes
        if (delegationRatios[member] != null) {
          computeDelegatedVoteWeight(
            member,
            accumulatedVoteWeights,
            accumulatedVoteWeightsByAccount,
            { ...visited, [representative]: true },
            brokenEdges,
          )
        }
      })

      return [
        accumulatedVoteWeights,
        accumulatedVoteWeightsByAccount,
        brokenEdges,
      ]
    }
    // Depth first
    return Object.keys(delegationRatios[representative]).reduce(
      ([accVoteWeights, accVoteWeightsByAccount, brokenEdges], member) => {
        // for each address delegated from to this delegate (`to`)
        const { numerator, denominator } =
          delegationRatios[representative][member]
        const ratio = numerator / denominator
        const delegatorVoteWeight = (voteWeights[member] ?? 0) * ratio

        // add votes delegated to the delegator
        if (delegationRatios[member] != null) {
          // if the delegator has delegated votes
          try {
            ;[accVoteWeights, accVoteWeightsByAccount, brokenEdges] =
              computeDelegatedVoteWeight(
                member,
                accumulatedVoteWeights,
                accumulatedVoteWeightsByAccount,
                { ...visited, [representative]: true },
                brokenEdges,
              )
          } catch (e) {
            // TODO: this is how we break cycles, its not ideal or clearly defined
            // If cycle add only delegator's votes (NOT delegated votes)
            accumulatedVoteWeights[representative] =
              (accumulatedVoteWeights[representative] ?? 0) +
              delegatorVoteWeight
            accVoteWeightsByAccount[representative] = {
              ...accVoteWeightsByAccount[representative],
              [member]: delegatorVoteWeight,
            }
            console.log(
              `Delegation from ${member} to ${representative} only adds delegator's votes (NOT votes delegated to the delegator)`,
            )
            return [
              accVoteWeights,
              accVoteWeightsByAccount,
              { ...brokenEdges, [member]: representative },
            ]
          }
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
        return [accVoteWeights, accVoteWeightsByAccount, brokenEdges]
      },
      [accumulatedVoteWeights, accumulatedVoteWeightsByAccount, brokenEdges],
    )
  }

  const resultingVoteWeights = Object.keys(delegationRatios).reduce(
    // for each address delegated to
    (
      [delegateToVoteWeight, delegateToDelegatorToVoteWeight, brokenEdges],
      to,
    ) => {
      if (delegateToVoteWeight[to] == null) {
        return computeDelegatedVoteWeight(
          to,
          delegateToVoteWeight as DelegateToVoteWeight,
          delegateToDelegatorToVoteWeight as DelegateToDelegatorToVoteWeight,
          {},
          brokenEdges as BrokenEdges,
        )
      }
      return [
        delegateToVoteWeight,
        delegateToDelegatorToVoteWeight,
        brokenEdges,
      ]
    },
    [
      {} as DelegateToVoteWeight,
      {} as DelegateToDelegatorToVoteWeight,
      {} as BrokenEdges,
    ],
  )
  return resultingVoteWeights as [
    DelegateToVoteWeight,
    DelegateToDelegatorToVoteWeight,
    BrokenEdges,
  ]
}
