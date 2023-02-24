import "mocha"
import { expect } from "chai"
import { computeVoteWeights } from "./compute-vote-weights"
import {
  DelegateToDelegatorToRatio,
  DelegateToDelegatorToVoteWeight,
  DelegateToVoteWeight,
  Ratio,
} from "../../types"
import R from "ramda"

describe("compute-vote-weights", () => {
  describe("computeVoteWeights", () => {
    it("should return correct (delegator -> vote weight) map", () => {
      const delegationRatios: {
        [delegate: string]: { [from: string]: Ratio }
      } = {
        "0x01": { "0x04": { numerator: 1, denominator: 1 } },
        "0x02": {
          "0x09": { numerator: 1, denominator: 2 },
          "0x06": { numerator: 1, denominator: 1 },
          "0x05": { numerator: 1, denominator: 1 },
        },
        "0x03": {
          "0x07": { numerator: 1, denominator: 1 },
          "0x13": { numerator: 1, denominator: 1 },
        },
        "0x04": { "0x08": { numerator: 1, denominator: 2 } },
        "0x07": {
          "0x08": { numerator: 1, denominator: 2 },
          "0x10": { numerator: 1, denominator: 2 },
          "0x09": { numerator: 1, denominator: 2 },
        },
        "0x09": {
          "0x11": { numerator: 1, denominator: 1 },
          "0x10": { numerator: 1, denominator: 2 },
        },
        "0x13": { "0x12": { numerator: 1, denominator: 1 } },
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

      const [delegateToVoteWeight] = computeVoteWeights(delegationRatios, votes)

      const expected: DelegateToVoteWeight = {
        "0x01": 7.5 + 44, // delegated(0x04) + 0x04
        "0x02": 8 / 2 + 45 + 4 + 12, // delegated(0x09)/2 + 0x09/2 + 0x06 + 0x05
        "0x03": 7.5 + 4 + 49 + 32 + 2, // delegated(0x07) + 0x07 + delegated(0x13)
        "0x04": 15 / 2, // 0x08/2
        "0x07": 15 / 2 + 8 / 2 + 8 / 2 + 90 / 2, // 0x08/2 + 0x10/2 + delegated(0x9)/2 + 0x09/2 + delegated(0x13)
        "0x09": 4 + 8 / 2, // 0x11 + 0x10/2
        "0x13": 2 + 0, // 0x12 + 0x13
      }

      expect(delegateToVoteWeight).to.deep.equal(expected)
    })

    it("should return correct (delegator -> delegate -> vote weight) map", () => {
      const delegationRatios: DelegateToDelegatorToRatio = {
        "0x01": { "0x04": { numerator: 1, denominator: 1 } },
        "0x02": {
          "0x09": { numerator: 1, denominator: 2 },
          "0x06": { numerator: 1, denominator: 1 },
          "0x05": { numerator: 1, denominator: 1 },
        },
        "0x03": {
          "0x07": { numerator: 1, denominator: 1 },
          "0x13": { numerator: 1, denominator: 1 },
        },
        "0x04": { "0x08": { numerator: 1, denominator: 2 } },
        "0x07": {
          "0x08": { numerator: 1, denominator: 2 },
          "0x10": { numerator: 1, denominator: 2 },
          "0x09": { numerator: 1, denominator: 2 },
        },
        "0x09": {
          "0x11": { numerator: 1, denominator: 1 },
          "0x10": { numerator: 1, denominator: 2 },
        },
        "0x13": { "0x12": { numerator: 1, denominator: 1 } },
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

      const [, delegationToRatio] = computeVoteWeights(delegationRatios, votes)

      const expected: DelegateToDelegatorToVoteWeight = {
        "0x01": { "0x04": 7.5 + 44 }, // 0x04 + delegated(0x04)
        "0x02": {
          "0x09": (90 + 8) / 2, // (0x09 + delegated(0x09))/2
          "0x06": 12 + 0, // 0x06 + delegated(0x06)
          "0x05": 4 + 0, // 0x05 + delegated(0x05)
        },
        "0x03": {
          "0x07": 32 + 60.5, // 0x07 + delegated(0x07)
          "0x13": 0 + 2, // 0x13 + delegated(0x13)
        },
        "0x04": { "0x08": (15 + 0) / 2 }, // (0x08 + delegated(0x08))/2
        "0x07": {
          "0x08": (15 + 0) / 2, // (0x08 + delegated(0x08))/2
          "0x10": (8 + 0) / 2, // (0x10 + delegated(0x10))/2
          "0x09": (90 + 8) / 2, // (0x09 + delegated(0x09))/2
        },
        "0x09": {
          "0x11": 4 + 0, // 0x11 + delegated(0x11)
          "0x10": (8 + 0) / 2, // (0x10 + delegated(0x10))/2
        },
        "0x13": { "0x12": 2 + 0 }, // 0x12 + delegated(0x12)
      }

      expect(delegationToRatio).to.deep.equal(expected)
    })

    it("should handle cycles in the delegation graph. Cycles are: (0x01 -> 0x02 -> 0x04 -> 0x01) and (0x04 -> 0x01 -> 0x02 -> 0x04))", () => {
      const delegationRatios: DelegateToDelegatorToRatio = {
        "0x01": {
          // ok
          "0x04": { numerator: 1, denominator: 2 }, // 75,25
        },
        "0x02": {
          // ok
          "0x01": { numerator: 1, denominator: 1 }, // 3 cut off
          "0x06": { numerator: 1, denominator: 1 }, // 12
          "0x05": { numerator: 1, denominator: 1 }, // 4
        },
        "0x03": {
          // ok
          "0x07": { numerator: 1, denominator: 1 }, // 103,5
          "0x13": { numerator: 1, denominator: 1 }, // 2
        },
        "0x04": {
          // OK
          "0x02": { numerator: 1, denominator: 1 }, // 99
          "0x08": { numerator: 1, denominator: 2 }, // 7.5
        },
        "0x07": {
          // ok
          "0x08": { numerator: 1, denominator: 2 }, //7.5
          "0x10": { numerator: 1, denominator: 2 }, // 4
          "0x09": { numerator: 1, denominator: 2 }, // 60
        },
        "0x09": {
          // ok
          "0x11": { numerator: 1, denominator: 1 }, // 4
          "0x10": { numerator: 1, denominator: 2 }, // 4
          "0x04": { numerator: 1, denominator: 2 }, // 22 cut off
        },
        "0x13": {
          // ok
          "0x12": { numerator: 1, denominator: 1 }, // 2
        },
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

      const [delegateToVoteWeight, delegationToRatio] = computeVoteWeights(
        delegationRatios,
        votes,
      )

      // TODO: this must be validated. Is this what we want?
      const expected: DelegateToVoteWeight = {
        "0x01": 75.25,
        "0x02": 19,
        "0x03": 105.5,
        "0x04": 106.5,
        "0x07": 71.5,
        "0x09": 30,
        "0x13": 2,
      }

      expect(delegateToVoteWeight).to.deep.equal(expected)
    })
  })
})
