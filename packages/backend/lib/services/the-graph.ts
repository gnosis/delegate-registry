import { getBuiltGraphSDK } from "../../.graphclient"

export const getContextFromAllChains = async (snapshotSpace: string) => {
  const sdk = getBuiltGraphSDK()
  // Second parameter is the context value
  const results = await sdk.GetContext({
    contextId: snapshotSpace,
    chainNames: ["gnosis", "goerli"],
  })
  return results.crossContext
}

export const getContextIdsFromAllChains = async () => {
  const sdk = getBuiltGraphSDK()
  // Second parameter is the context value
  const results = await sdk.GetContextIds({
    chainNames: ["gnosis", "goerli"],
  })
  console.log("results", results)
  return results.crossContexts
}
