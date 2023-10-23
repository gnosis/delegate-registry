import { getBuiltGraphSDK } from "./.graphclient"

// TODO: move to env variable and document that the subgraphs have to end in these names
const CHAIN_NAMES = ["gnosis", "mainnet", "goerli"]

export const fetchDelegationSetsFromAllChains = async (
  snapshotSpace: string,
  timestamp?: number,
) => {
  console.log("fetchDelegationSetsFromAllChains snapshot space:", snapshotSpace)

  const sdk = getBuiltGraphSDK()
  const results =
    timestamp == null
      ? await Promise.all(
          CHAIN_NAMES.map((chainName) =>
            sdk
              .GetDelegationSets(
                {
                  first: 10000,
                  contextId: snapshotSpace,
                },
                {
                  chainName,
                },
              )
              .then((data) => data.delegationSets),
          ),
        )
      : await Promise.all(
          CHAIN_NAMES.map((chainName) =>
            sdk
              .GetDelegationSetsAtTimestamp(
                {
                  first: 100000,
                  contextId: snapshotSpace,
                  timestamp,
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
  console.log("CHAIN_NAMES:", CHAIN_NAMES)
  console.log("fetchContextIdsFromAllChains results:", results)

  return results.flat()
}

export const fetchOptoutsFromAllChains = async (
  snapshotSpace: string,
  timestamp?: number,
) => {
  const sdk = getBuiltGraphSDK()
  const results =
    timestamp == null
      ? await Promise.all(
          CHAIN_NAMES.map((chainName) =>
            sdk
              .GetOptouts(
                {
                  contextId: snapshotSpace,
                },
                {
                  chainName,
                },
              )
              .then((data) => data.optouts),
          ),
        )
      : await Promise.all(
          CHAIN_NAMES.map((chainName) =>
            sdk
              .GetOptoutsAtTimestamp(
                {
                  contextId: snapshotSpace,
                  timestamp,
                },
                {
                  chainName,
                },
              )
              .then((data) => data.optouts),
          ),
        )
  return results.flat()
}
