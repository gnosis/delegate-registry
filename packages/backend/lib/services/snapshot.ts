import snapshot from "@snapshot-labs/snapshot.js"
import * as R from "ramda"
import fetch from "node-fetch"

type SnapshotStrategy = {
  name: string
  params: Record<string, string>
  network: string
}

const SNAPSHOT_HUB = "https://hub.snapshot.org"
const SNAPSHOT_HUB_GOERLI = "https://testnet.snapshot.org"

export const fetchVoteWeights = async (
  snapshotSpace: string,
  addresses: string[],
  blockNumber?: number,
): Promise<Record<string, number>> => {
  const strategies = await getStrategies(snapshotSpace)
  if (strategies.length === 0) {
    console.log("No strategies found for space: ", snapshotSpace)
    return {}
  }
  return strategies.reduce(async (acc, strategy) => {
    if (Object.keys(acc).length === 0) {
      const scores = (await snapshot.utils.getScores(
        snapshotSpace,
        [strategy],
        strategy.network,
        addresses,
        blockNumber,
      )) as Array<Record<string, number>>
      return scores.reduce((acc, score) => ({ ...acc, ...score }), {})
    }
    const scores = await snapshot.utils.getScores(
      snapshotSpace,
      [strategy],
      strategy.network,
      addresses,
      blockNumber,
    )
    return R.mergeWith(R.add, acc, scores)
  }, {})
}

const getStrategies = async (snapshotSpace: string) => {
  try {
    const strategies: SnapshotStrategy[] = await getSnapshotSpaceSettings(
      snapshotSpace,
      false,
    ).then((_) => _.strategies)
    return strategies.filter(
      (strategy) => strategy.name !== "delegation", // TODO: fix: this is hacky
    )
  } catch (error) {
    if (error instanceof TypeError) {
      console.log(
        `${error.name} error fetching strategies for space: ${snapshotSpace}. Message: ${error.message}`,
      )
    }
    return []
  }
}

export const getSnapshotSpaceSettings = async (
  ensName: string,
  testSpace: boolean,
) => {
  const res = await fetch(`${getHubUrl(testSpace)}/api/spaces/${ensName}`)
  if (res.ok) {
    try {
      return await res.json()
    } catch (error) {
      return undefined // there is not snapshot space for this ENS
    }
  } else {
    throw res
  }
}

const getHubUrl = (testSpace: boolean = false) =>
  testSpace ? SNAPSHOT_HUB_GOERLI : SNAPSHOT_HUB
