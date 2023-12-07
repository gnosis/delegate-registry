import snapshot from "@snapshot-labs/snapshot.js"
import { getAddress } from "ethers/lib/utils"
import * as R from "ramda"
// import fetch from "node-fetch"

export type DelegateRegistryStrategyParams = {
  strategies: SnapshotStrategy[]
  backendUrl: string
  mainChainId: number
  delegationV1VChainIds?: number[]
}

export type Space = {
  name: string
  network: string
  strategies: SnapshotStrategy[]
}

export type SnapshotStrategy = {
  name: string
  params: Record<string, string>
  network: string
}

const SNAPSHOT_HUB = "https://hub.snapshot.org"
const SNAPSHOT_HUB_GOERLI = "https://testnet.snapshot.org"
const MAXIMUM_ADDRESSES_PER_REQUEST = 500

/**
 * Fetches the and returns the vote weights for each address in a given space.
 *
 * It uses the active strategies for the space to calculate the vote weights
 * (except the delegation strategy).
 *
 * @param spaceName - The space name
 * @param addresses - The addresses to get the vote weights for
 * @param blockNumber - The block number to get the vote weights at
 * @returns a map of address to vote weight
 */
export const fetchVoteWeights = async (
  spaceName: string,
  addresses: string[],
  blockNumber?: number,
  strategies?: SnapshotStrategy[],
): Promise<Record<string, number>> => {
  if (strategies == null) {
    strategies = await fetchStrategies(spaceName)
  }
  // console.log("strategies", strategies)
  if (strategies.length === 0) {
    console.log(
      "No strategies found for space: ",
      spaceName,
      " on the snapshot hub. Trying to get test space strategies.",
    )
    // TODO: WARNING: If no snapshot space if found, this tries to get strategies from the Snapshot test hub.
    strategies = await fetchStrategies(spaceName, true)
    if (strategies.length === 0) {
      console.log(
        "Also no strategies found for TEST space: ",
        spaceName,
        " on the snapshot TEST hub.",
      )
      return {}
    } else {
      console.log(
        "Found strategies for TEST space: ",
        spaceName,
        " on the snapshot TEST hub.",
      )
    }
  }
  if (strategies == null) {
    throw new Error("No strategies found for space: " + spaceName)
  }

  const promises: Promise<[Record<string, number>][]>[] = []

  console.log(`[${spaceName}] Getting scores for ${addresses.length} addresses`)

  for (let i = 0; i < addresses.length; i += MAXIMUM_ADDRESSES_PER_REQUEST) {
    const addressesChunk = addresses.slice(i, i + MAXIMUM_ADDRESSES_PER_REQUEST)
    console.log(
      `[${spaceName}] Getting scores for addresses ${i} to ${
        i + MAXIMUM_ADDRESSES_PER_REQUEST
      } of ${addresses.length} addresses`,
    )
    promises.push(
      ...strategies.map((strategy) => {
        console.log(
          `[${spaceName}] Getting scores for strategy: ${strategy.name} on network: ${strategy.network}`,
        )
        return snapshot.utils.getScores(
          spaceName,
          [strategy],
          strategy.network,
          addressesChunk,
          blockNumber,
        )
      }),
    )
  }

  const scoresChunks = await Promise.all(promises)

  console.log(`[${spaceName}] Got scores for chunk. Merging...`)
  // Merge scoresChunks into mergedScores
  const mergedScores = scoresChunks.reduce((acc, [scores]) => {
    for (const [rawAddress, score] of Object.entries(scores)) {
      const address = getAddress(rawAddress)
      acc[address] = (acc[address] ?? 0) + score
    }
    return acc
  }, {})

  return mergedScores

  // return strategies.reduce(async (accPromise, strategy) => {
  //   const acc = await accPromise
  //   try {
  //     const rawScores = await snapshot.utils.getScores(
  //       spaceName,
  //       [strategy],
  //       strategy.network,
  //       addresses,
  //       blockNumber,
  //     )
  //     const scores = scoresAsObject(rawScores)
  //     return Object.keys(acc).length === 0
  //       ? scores
  //       : R.mergeWith(R.add, acc, scores)
  //   } catch (error) {
  //     console.log(
  //       `[${spaceName}] Error when getting scores from snapshot (using snapshot.js). Error`,
  //       error,
  //     )
  //     console.log("Failing call: await snapshot.utils.getScores(", {
  //       spaceName,
  //       strategies: [strategy],
  //       network: strategy.network,
  //       addresses,
  //       blockNumber,
  //     })

  //     return acc
  //   }
  // }, {} as Promise<Record<string, number>>)
}

/**
 * Fetches the strategies for a given space, except the delegation strategy.
 *
 * @param spaceName - The space name
 * @returns the strategies for the space or a empty array if no strategies were found
 */
const fetchStrategies = async (
  spaceName: string,
  testSpace: boolean = false,
): Promise<SnapshotStrategy[]> => {
  try {
    const strategies = await fetchSnapshotSpaceSettings(
      spaceName,
      testSpace,
    ).then((_) => _.strategies)
    return (strategies.find(
      (strategy) => strategy.name === "delegate-registry-v2",
    )?.params.strategies ?? []) as SnapshotStrategy[]
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `${error.name} error fetching strategies for space: ${spaceName}. Message: ${error.message}`,
      )
    }
    return []
  }
}

/**
 * Fetches the settings for a given space.
 *
 * @param spaceName - The space name
 * @param testSpace - Whether to fetch the settings for the test Hub
 * @returns the settings for the space
 */
export const fetchSnapshotSpaceSettings = async (
  spaceName: string,
  testSpace: boolean,
): Promise<Space> => {
  console.log("fetchSnapshotSpaceSettings", spaceName)
  console.log("testSpace", testSpace)
  const res = await fetch(`${getHubUrl(testSpace)}/api/spaces/${spaceName}`, {})
  if (res.ok) {
    try {
      const resJson = await res.json()
      // console.log("resJson", resJson)
      return resJson
    } catch (error) {
      throw Error(
        `The response from the Snapshot Hub was not valid JSON. Most likely the space does not exist for ${spaceName}.`,
      )
    }
  } else {
    throw res
  }
}

const getHubUrl = (testSpace: boolean = false) =>
  testSpace ? SNAPSHOT_HUB_GOERLI : SNAPSHOT_HUB

const scoresAsObject = (scores: Array<Record<string, number>>) =>
  scores.reduce((acc, scoreObj) => ({ ...acc, ...scoreObj }), {})

export async function getV1DelegatesBySpace(
  space: string,
  network: string,
  timestamp?: number,
) {
  const subgraphUrl = snapshot.utils.SNAPSHOT_SUBGRAPH_URL[network]
  if (!subgraphUrl) {
    return Promise.reject(
      `Delegation subgraph not available for network ${network}`,
    )
  }
  const spaceIn = ["", space]
  if (space.includes(".eth")) spaceIn.push(space.replace(".eth", ""))

  const PAGE_SIZE = 1000
  let result = []
  let page = 0
  const params: any = {
    delegations: {
      __args: {
        where: {
          space_in: spaceIn, // TODO: add timestamp
          ...(timestamp != null ? { timestamp_lt: timestamp } : {}),
        },
        first: PAGE_SIZE,
        skip: 0,
      },
      delegator: true,
      space: true,
      delegate: true,
    },
  }

  while (true) {
    params.delegations.__args.skip = page * PAGE_SIZE

    const pageResult = await snapshot.utils.subgraphRequest(subgraphUrl, params)
    const pageDelegations = pageResult.delegations || []
    result = result.concat(pageDelegations)
    page++
    if (pageDelegations.length < PAGE_SIZE) break
  }

  return result
}
