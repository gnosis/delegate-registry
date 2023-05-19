import { getBuiltGraphSDK } from "./.graphclient"

// TODO: move to env variable and document that the subgraphs have to end in these names
// const CHAIN_NAMES = ["gnosis", "goerli"]
const CHAIN_NAMES = ["goerli"]

export const fetchContextFromAllChains = async (
  snapshotSpace: string,
  blocknumber?: number, // main chain (the chain specified in the Snapshot space) blocknumber
  mainChain: string = "goerli",
) => {
  const sdk = getBuiltGraphSDK()
  const results =
    blocknumber == null
      ? await sdk.GetContext({
          // get newest
          contextId: snapshotSpace,
          chainNames: CHAIN_NAMES,
        })
      : await sdk.GetContextAtBlocknumber({
          // get at blocknumber (internally uses the timestamp of the block on the main chain)
          contextId: snapshotSpace,
          chainNames: CHAIN_NAMES,
          mainChain,
          blocknumber, // TODO: need to figure out how to get the correct blocknumber for other chains than the "main-chain"
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
