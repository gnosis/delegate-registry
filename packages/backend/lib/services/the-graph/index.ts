import { getBuiltGraphSDK } from "./.graphclient"

// TODO: move to env variable and document that the subgraphs have to end in these names
const CHAIN_NAMES = ["gnosis", "goerli"]

export const fetchDelegationSetsFromAllChains = async (
  snapshotSpace: string,
  timestamp?: number,
) => {
  console.log("fetchDelegationSetsFromAllChains snapshot space:", snapshotSpace)

  const sdk = getBuiltGraphSDK()
  const results = await Promise.all(
    CHAIN_NAMES.map((chainName) =>
      sdk
        .GetDelegationSets(
          {
            // first: 5000,
            contextId: snapshotSpace,
          },
          {
            chainName,
          },
        )
        .then((data) => data.delegationSets),
    ),
  )
  return results.flat()
}

export const fetchContextIdsFromAllChains = async () => {
  const sdk = getBuiltGraphSDK()
  const results = await Promise.all(
    CHAIN_NAMES.map((chainName) =>
      sdk
        .GetContextIds(
          {},
          {
            chainName,
          },
        )
        .then((data) => data.contexts),
    ),
  )
  return results.flat()
}
