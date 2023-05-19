import "mocha"
import { expect } from "chai"
import R from "ramda"
import { DelegationSet, Optout } from "../../types"
import {
  mergeDelegationOptouts,
  mergeDelegationSets,
} from "./merge-delegation-sets"

const delegationSets1: DelegationSet[] = [
  {
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
]

const delegationSets2: DelegationSet[] = [
  {
    fromAccount: { id: "0x67A16655c1c46f8822726e989751817c49f29054" },
    delegations: [
      {
        toAccount: {
          id: "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8",
        },
        numerator: "1",
      },
    ],
    expireTimestamp: "1876538446",
    denominator: "40",
    creationTimestamp: "1676539571",
  },
  {
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
  {
    fromAccount: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [],
    creationTimestamp: "1776538446",
    denominator: "8",
    expireTimestamp: "1776538828",
  },
]

const delegationSets3: DelegationSet[] = [
  {
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
  {
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
  {
    fromAccount: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [
      {
        toAccount: {
          id: "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190",
        },
        numerator: "1",
      },
      {
        toAccount: {
          id: "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8",
        },
        numerator: "1",
      },
    ],
    expireTimestamp: "1876538446",
    denominator: "900",
    creationTimestamp: "1676549721",
  },
]

describe("merge-delegation-sets", () => {
  describe("mergeDelegationSets", () => {
    it("should return correct (delegator -> vote weight) map when merging example sets 1, 2 and 3", () => {
      const mergedDelegationSets = mergeDelegationSets([
        delegationSets1,
        delegationSets2,
        delegationSets3,
      ])

      expect(R.keys(mergedDelegationSets).length).equal(
        4,
        "should have 4 delegators",
      )
      expect(
        mergedDelegationSets["0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4"]
          .delegations.length,
      ).equal(0)
    })
    it("should return correct (delegator -> vote weight) map when merging example sets 1 and 2", () => {
      const mergedDelegationSets = mergeDelegationSets([
        delegationSets1,
        delegationSets2,
      ])

      expect(mergedDelegationSets).deep.equal(
        mergeDelegationSets([delegationSets2]),
        "the returning delegation set should be the same as the second delegation set (the delegation set in the `delegationSets1` is replaced in the `delegationSets1` set)",
      )
    })
  })
  describe("mergeDelegationOptouts", () => {
    const optout1: Optout[] = [
      {
        account: {
          id: "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A",
        },
        status: true,
        creationTimestamp: "1776379432",
      },
    ]

    const optout2: Optout[] = [
      {
        account: {
          id: "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A",
        },
        status: false,
        creationTimestamp: "1376379432",
      },
    ]
    const optout3: Optout[] = [
      {
        account: {
          id: "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A",
        },
        status: false,
        creationTimestamp: "1676379432",
      },
      {
        account: {
          id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6b",
        },
        status: true,
        creationTimestamp: "1676379432",
      },
    ]

    it("should return the expected merged set of optouts", () => {
      const mergedOptouts = mergeDelegationOptouts([optout1, optout2, optout3])

      expect(mergedOptouts.length).equal(2)
      expect(mergedOptouts).to.contain(optout3[1].account.id)
      expect(mergedOptouts).to.contain(optout3[0].account.id)
    })
    it("should return only one and the correct optout when two different optout set arrays, with only the same optout is provided", () => {
      const mergedOptouts = mergeDelegationOptouts([optout1, optout2])

      expect(mergedOptouts.length).equal(1)
      expect(mergedOptouts).to.contain(optout3[0].account.id)
    })
  })
})
