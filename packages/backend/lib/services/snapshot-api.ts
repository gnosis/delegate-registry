import snapshot from "@snapshot-labs/snapshot.js"
import { strategies } from "../../config"
import * as R from "ramda"

const space = process.env.SNAPSHOT_SPACE
if (space == null) {
  throw Error("SNAPSHOT_SPACE is not defined")
}

export const getVoteWeights = async (
  addresses: string[],
  blockNumber?: number,
): Promise<Record<string, number>> =>
  strategies.reduce(async (acc, strategy) => {
    if (Object.keys(acc).length === 0) {
      const scores = (await snapshot.utils.getScores(
        space,
        [strategy],
        strategy.network,
        addresses,
        blockNumber,
      )) as Array<Record<string, number>>
      return scores.reduce((acc, score) => ({ ...acc, ...score }), {})
    }
    const scores = await snapshot.utils.getScores(
      space,
      [strategy],
      strategy.network,
      addresses,
      blockNumber,
    )
    return R.mergeWith(R.add, acc, scores)
  }, {})
