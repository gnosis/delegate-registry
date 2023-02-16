import { getBuiltGraphSDK } from "../../.graphclient"

export const getCrossContexts = async (snapshotSpace: string) => {
  const sdk = getBuiltGraphSDK()
  // Second parameter is the context value
  const results = await sdk.GetCrossContext({
    contextId: snapshotSpace,
    chainNames: ["gnosis", "goerli"],
  })
  return results.crossContext
}
