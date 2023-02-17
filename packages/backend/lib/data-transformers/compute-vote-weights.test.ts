import "mocha"
import { expect } from "chai"
import { computeDelegatedVoteWeights } from "./compute-vote-weights"

describe("compute-vote-weights", () => {
  describe("computeDelegateeVoteWeights", () => {
    it("should return correct values on example graph", () => {
      const delegationRatios: { [to: string]: { [from: string]: number } } = {
        "0x01": { "0x04": 1 },
        "0x02": { "0x09": 0.5, "0x06": 1, "0x05": 1 },
        "0x03": { "0x07": 1, "0x13": 1 },
        "0x04": { "0x08": 0.5 },
        "0x07": { "0x08": 0.5, "0x10": 0.5, "0x09": 0.5 },
        "0x09": { "0x11": 1, "0x10": 0.5 },
        "0x13": { "0x12": 1 },
      }

      const votes: { [address: string]: number } = {
        "0x01": 3,
        "0x02": 80,
        "0x03": 7,
        "0x04": 44,
        "0x05": 4,
        "0x06": 12,
        "0x07": 32,
        "0x08": 15,
        "0x09": 90,
        "0x10": 8,
        "0x11": 4,
        "0x12": 2,
        "0x13": 0,
      }

      const voteWeights = computeDelegatedVoteWeights(delegationRatios, votes)

      const expected = {
        "0x01": 7.5 + 44, // delegated(0x04) + 0x04
        "0x02": 8 / 2 + 45 + 4 + 12, // delegated(0x09)/2 + 0x09/2 + 0x06 + 0x05
        "0x03": 7.5 + 4 + 49 + 32 + 2, // delegated(0x07) + 0x07 + delegated(0x13)
        "0x04": 15 / 2, // 0x08/2
        "0x07": 15 / 2 + 8 / 2 + 8 / 2 + 90 / 2, // 0x08/2 + 0x10/2 + delegated(0x9)/2 + 0x09/2 + delegated(0x13)
        "0x09": 4 + 8 / 2, // 0x11 + 0x10/2
        "0x13": 2 + 0, // 0x12 + 0x13
      }

      expect(voteWeights).to.deep.equal(expected)
    })
  })
})
