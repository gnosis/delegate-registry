import { getBuiltGraphSDK } from "./.graphclient"

// TODO: move to env variable and document that the subgraphs have to end in these names
const CHAIN_NAMES = ["gnosis", "goerli"]

export const fetchContextFromAllChains = async (
  snapshotSpace: string,
  timestamp?: number,
) => {
  snapshotSpace.includes("GraphQLError")

  const sdk = getBuiltGraphSDK()
  const results =
    timestamp == null
      ? await sdk.GetContext({
          // get newest
          contextId: snapshotSpace,
          chainNames: CHAIN_NAMES,
        })
      : await sdk.GetContextAtTimestamp({
          // gets the whats active at the current timestamp
          contextId: snapshotSpace,
          chainNames: CHAIN_NAMES,
          timestamp,
        })
  return results.crossContext
}

export const fetchContextIdsFromAllChains = async () => {
  const sdk = getBuiltGraphSDK()
  const results = await sdk.GetContextIds({
    chainNames: CHAIN_NAMES,
  })
  return results.crossContexts
}
