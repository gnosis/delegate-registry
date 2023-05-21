import "mocha"
import { expect } from "chai"
import { generateDelegationRatioMap } from "./generate-delegation-ratio-map"
import { DelegationSet } from "../../types"

const delegatorToDelegationSets: { [frmAccount: string]: DelegationSet } = {
  "0xD028d504316FEc029CFa36bdc3A8f053F6E5a6e4": {
    fromAccount: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [
      {
        toAccount: {
          id: "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190",
        },
        numerator: "400",
      },
      {
        toAccount: {
          id: "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8",
        },
        numerator: "500",
      },
    ],
    expireTimestamp: "1876538446",
    denominator: "900",
    creationTimestamp: "1676549720",
  },
  "0x67A16655c1c46f8822726e989751817c49f29054": {
    fromAccount: { id: "0x67A16655c1c46f8822726e989751817c49f29054" },
    delegations: [
      {
        toAccount: {
          id: "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190",
        },
        numerator: "40",
      },
    ],
    expireTimestamp: "1876538446",
    denominator: "40",
    creationTimestamp: "1676539572",
  },
  "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190": {
    fromAccount: { id: "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190" },
    delegations: [
      {
        toAccount: {
          id: "0x7ef021f62e3e7975fbc21d3202c5a1f19d53bb47",
        },
        numerator: "4",
      },
      {
        toAccount: {
          id: "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905",
        },
        numerator: "13",
      },
    ],
    expireTimestamp: "1776538446",
    denominator: "17",
    creationTimestamp: "1676539116",
  },
  "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A": {
    fromAccount: { id: "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A" },
    delegations: [
      {
        toAccount: {
          id: "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8",
        },
        numerator: "3",
      },
      {
        toAccount: {
          id: "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905",
        },
        numerator: "6",
      },
    ],
    expireTimestamp: "500",
    denominator: "9",
    creationTimestamp: "1676379552",
  },
}

describe("generate-delegation-ratio-map", () => {
  describe("generateDelegationRatioMap", () => {
    it("should return correct DelegateToDelegatorToRatio map", () => {
      const delegationRatioMap = generateDelegationRatioMap(
        delegatorToDelegationSets,
      )

      const expected = {
        "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190": {
          "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4": {
            numerator: "400",
            denominator: "900",
          },
          "0x67A16655c1c46f8822726e989751817c49f29054": {
            numerator: "40",
            denominator: "40",
          },
        },
        "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8": {
          "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4": {
            numerator: "500",
            denominator: "900",
          },
          "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A": {
            numerator: "3",
            denominator: "9",
          },
        },
        "0x7ef021f62e3e7975fbc21d3202c5a1f19d53bb47": {
          "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190": {
            numerator: "4",
            denominator: "17",
          },
        },
        "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905": {
          "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190": {
            numerator: "13",
            denominator: "17",
          },
          "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A": {
            numerator: "6",
            denominator: "9",
          },
        },
      }
      expect(delegationRatioMap).to.deep.equal(expected)
    })
  })
})
