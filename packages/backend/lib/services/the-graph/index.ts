import { getBuiltGraphSDK } from "./.graphclient"

// TODO: move to env variable and document that the subgraphs have to end in these names
// const CHAIN_NAMES = ["gnosis", "goerli"]
const CHAIN_NAMES = ["goerli"]

export const fetchContextFromAllChains = async (
  snapshotSpace: string,
  blocknumber?: number,
) => {
  const sdk = getBuiltGraphSDK()
  const results =
    blocknumber == null
      ? await sdk.GetContext({
          contextId: snapshotSpace,
          chainNames: CHAIN_NAMES,
        })
      : await sdk.GetContextAtBlocknumber({
          contextId: snapshotSpace,
          chainNames: CHAIN_NAMES,
          blocknumber,
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
