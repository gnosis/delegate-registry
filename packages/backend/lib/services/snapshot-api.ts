import snapshot from "@snapshot-labs/snapshot.js"

const space = process.env.SNAPSHOT_SPACE
if (space == null) {
  throw Error("SNAPSHOT_SPACE is not defined")
}

const strategies = [
  {
    name: "erc20-balance-of",
    params: {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      decimals: 18,
    },
  },
]
const network = "1"

export const getVoteWeights = async (
  addresses: string[],
  blockNumber?: number,
) =>
  snapshot.utils.getScores(space, strategies, network, addresses, blockNumber)
