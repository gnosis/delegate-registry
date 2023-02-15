import * as theGraph from "./services/the-graph"

export const getAllDelegationsTo = async (snapshotSpace: string) => {
  // get context from all chains
  const responds = await theGraph.getContext(snapshotSpace)

  // merge all delegations by
  // 1. keeping the delegationSets with the highest `updateDelegation` time for each account
  // 2. remove optout delegators (and recompute dominators, across delegationSets)
  return

  // return responds.data?.delegates.reduce(
  //   (acc, { id: delegate, delegations }) => {
  //     acc[getAddress(delegate.slice(-40))] = delegations.reduce(
  //       (acc, { account: { id: accountAddress }, numerator, denominator }) => {
  //         acc[getAddress(accountAddress)] = { numerator, denominator }
  //         return acc
  //       },
  //       {} as Record<string, Ratio>,
  //     )
  //     return acc
  //   },
  //   {} as Record<string, Record<string, Ratio>>,
  // )
}
