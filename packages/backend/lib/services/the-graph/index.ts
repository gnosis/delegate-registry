import { getBuiltGraphSDK } from "../../../.graphclient"

// TODO: move to env variable and document that the subgraphs have to end in these names
const CHAIN_NAMES = ["gnosis", "goerli"]

export const fetchContextFromAllChains = async (snapshotSpace: string) => {
  const sdk = getBuiltGraphSDK()
  const results = await sdk.GetContext({
    contextId: snapshotSpace,
    chainNames: CHAIN_NAMES,
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
