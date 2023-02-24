import "mocha"
import { expect } from "chai"
import R from "ramda"
import { DelegationSet } from "../../types"
import { mergeDelegationSets } from "./merge-delegation-sets"

const delegationSets1: DelegationSet[] = [
  {
    account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [
      {
        delegate: {
          id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: "400",
      },
      {
        delegate: {
          id: "0xd714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: "500",
      },
    ],
    expiration: "1876538446",
    denominator: "900",
    delegationUpdated: "1676549720",
    expirationUpdated: "1676549720",
  },
]

const delegationSets2: DelegationSet[] = [
  {
    account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
    delegations: [
      {
        delegate: {
          id: "0xd714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
        },
        account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
        numerator: "1",
      },
    ],
    expiration: "1876538446",
    denominator: "40",
    delegationUpdated: "1676539571",
    expirationUpdated: "1676539572",
  },
  {
    account: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
    delegations: [
      {
        delegate: {
          id: "0x7ef021f62e3e7975fbc21d3202c5a1f19d53bb47",
        },
        account: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
        numerator: "4",
      },
      {
        delegate: {
          id: "0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905",
        },
        account: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
        numerator: "13",
      },
    ],
    expiration: "1776538446",
    denominator: "17",
    delegationUpdated: "1676539116",
    expirationUpdated: "1676539116",
  },
  {
    account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [],
    expiration: "1776538446",
    denominator: "8",
    delegationUpdated: "1776538828",
    expirationUpdated: "1676538828",
  },
]

const delegationSets3: DelegationSet[] = [
  {
    account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
    delegations: [
      {
        delegate: {
          id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190",
        },
        account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
        numerator: "40",
      },
    ],
    expiration: "1876538446",
    denominator: "40",
    delegationUpdated: "1676539572",
    expirationUpdated: "1676539572",
  },
  {
    account: { id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6a" },
    delegations: [
      {
        delegate: {
          id: "0xd714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
        },
        account: { id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6a" },
        numerator: "3",
      },
      {
        delegate: {
          id: "0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905",
        },
        account: { id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6a" },
        numerator: "6",
      },
    ],
    expiration: "500",
    denominator: "9",
    delegationUpdated: "1676379552",
    expirationUpdated: "1676379552",
  },
  {
    account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [
      {
        delegate: {
          id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: "1",
      },
      {
        delegate: {
          id: "0xd714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: "1",
      },
    ],
    expiration: "1876538446",
    denominator: "900",
    delegationUpdated: "1676549721",
    expirationUpdated: "1676549720",
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
})
