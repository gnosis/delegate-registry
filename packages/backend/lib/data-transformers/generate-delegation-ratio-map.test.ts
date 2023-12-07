import "mocha"
import { expect } from "chai"
import { generateDelegationRatioMap } from "./generate-delegation-ratio-map"
import { DelegationSet } from "../../types"
import { getAddress } from "ethers/lib/utils"

const delegatorToDelegationSets: { [frmAccount: string]: DelegationSet } = {
  [getAddress("0xD028d504316FEc029CFa36bdc3A8f053F6E5a6e4")]: {
    fromAccount: {
      id: getAddress("0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4"),
    },
    delegations: [
      {
        toAccount: {
          id: getAddress("0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190"),
        },
        numerator: "400",
      },
      {
        toAccount: {
          id: getAddress("0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8"),
        },
        numerator: "500",
      },
    ],
    expireTimestamp: "1876538446",
    denominator: "900",
    creationTimestamp: "1676549720",
  },
  [getAddress("0x67A16655c1c46f8822726e989751817c49f29054")]: {
    fromAccount: {
      id: getAddress("0x67A16655c1c46f8822726e989751817c49f29054"),
    },
    delegations: [
      {
        toAccount: {
          id: getAddress("0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190"),
        },
        numerator: "40",
      },
    ],
    expireTimestamp: "1876538446",
    denominator: "40",
    creationTimestamp: "1676539572",
  },
  [getAddress("0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190")]: {
    fromAccount: {
      id: getAddress("0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190"),
    },
    delegations: [
      {
        toAccount: {
          id: getAddress("0x7ef021f62e3e7975fbc21d3202c5a1f19d53bb47"),
        },
        numerator: "4",
      },
      {
        toAccount: {
          id: getAddress("0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905"),
        },
        numerator: "13",
      },
    ],
    expireTimestamp: "1776538446",
    denominator: "17",
    creationTimestamp: "1676539116",
  },
  [getAddress("0x53bcFaEd43441C7bB6149563eC11f756739C9f6A")]: {
    fromAccount: {
      id: getAddress("0x53bcFaEd43441C7bB6149563eC11f756739C9f6A"),
    },
    delegations: [
      {
        toAccount: {
          id: getAddress("0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8"),
        },
        numerator: "3",
      },
      {
        toAccount: {
          id: getAddress("0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905"),
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
        [getAddress("0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190")]: {
          [getAddress("0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4")]: {
            numerator: "400",
            denominator: "900",
          },
          [getAddress("0x67A16655c1c46f8822726e989751817c49f29054")]: {
            numerator: "40",
            denominator: "40",
          },
        },
        [getAddress("0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8")]: {
          [getAddress("0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4")]: {
            numerator: "500",
            denominator: "900",
          },
          [getAddress("0x53bcFaEd43441C7bB6149563eC11f756739C9f6A")]: {
            numerator: "3",
            denominator: "9",
          },
        },
        [getAddress("0x7ef021f62e3e7975fbc21d3202c5a1f19d53bb47")]: {
          [getAddress("0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190")]: {
            numerator: "4",
            denominator: "17",
          },
        },
        [getAddress("0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905")]: {
          [getAddress("0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190")]: {
            numerator: "13",
            denominator: "17",
          },
          [getAddress("0x53bcFaEd43441C7bB6149563eC11f756739C9f6A")]: {
            numerator: "6",
            denominator: "9",
          },
        },
      }
      expect(delegationRatioMap).to.deep.equal(expected)
    })
  })
})
