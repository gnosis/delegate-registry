import "mocha"
import { expect } from "chai"
import { DelegationSet, Optout } from "../../types"
import {
  mergeDelegationOptouts,
  mergeDelegationSets,
} from "./merge-delegation-sets"
import { removeOptouts } from "./remove-optouts"
import { generateDelegationRatioMap } from "./generate-delegation-ratio-map"
import {
  convertDelegationSetsDelegateIdsToAddress,
  convertOptoutsDelegateIdsToAddress,
} from "./convert-to-address"

const delegationSets1: DelegationSet[] = [
  {
    account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [
      {
        delegate: {
          id: "0x000000000000000000000006cc5b30cd0a93c1f85c7868f5f2620ab8c458190",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: 400,
      },
      {
        delegate: {
          id: "0x00000000000000000000000d714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: 500,
      },
    ],
    expiration: 1876538446,
    denominator: 900,
    delegationUpdated: 1676549720,
    expirationUpdated: 1676549720,
  },
]

const delegationSets2: DelegationSet[] = [
  {
    account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
    delegations: [
      {
        delegate: {
          id: "0x00000000000000000000000d714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
        },
        account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
        numerator: 1,
      },
    ],
    expiration: 1876538446,
    denominator: 40,
    delegationUpdated: 1676539571,
    expirationUpdated: 1676539572,
  },
  {
    account: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
    delegations: [
      {
        delegate: {
          id: "0x000000000000000000000007ef021f62e3e7975fbc21d3202c5a1f19d53bb47",
        },
        account: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
        numerator: 4,
      },
      {
        delegate: {
          id: "0x00000000000000000000000de1e8a7e184babd9f0e3af18f40634e9ed6f0905",
        },
        account: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
        numerator: 13,
      },
    ],
    expiration: 1776538446,
    denominator: 17,
    delegationUpdated: 1676539116,
    expirationUpdated: 1676539116,
  },
  {
    account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [],
    expiration: 1776538446,
    denominator: 8,
    delegationUpdated: 1776538828,
    expirationUpdated: 1676538828,
  },
]

const delegationSets3: DelegationSet[] = [
  {
    account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
    delegations: [
      {
        delegate: {
          id: "0x000000000000000000000006cc5b30cd0a93c1f85c7868f5f2620ab8c458190",
        },
        account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
        numerator: 40,
      },
    ],
    expiration: 1876538446,
    denominator: 40,
    delegationUpdated: 1676539572,
    expirationUpdated: 1676539572,
  },
  {
    account: { id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6a" },
    delegations: [
      {
        delegate: {
          id: "0x00000000000000000000000d714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
        },
        account: { id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6a" },
        numerator: 3,
      },
      {
        delegate: {
          id: "0x00000000000000000000000de1e8a7e184babd9f0e3af18f40634e9ed6f0905",
        },
        account: { id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6a" },
        numerator: 6,
      },
    ],
    expiration: 500,
    denominator: 9,
    delegationUpdated: 1676379552,
    expirationUpdated: 1676379552,
  },
  {
    account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [
      {
        delegate: {
          id: "0x000000000000000000000006cc5b30cd0a93c1f85c7868f5f2620ab8c458190",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: 1,
      },
      {
        delegate: {
          id: "0x00000000000000000000000d714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: 1,
      },
    ],
    expiration: 1876538446,
    denominator: 900,
    delegationUpdated: 1676549721,
    expirationUpdated: 1676549720,
  },
]

const optout1: Optout[] = [
  {
    delegate: {
      id: "0x00000000000000000000000053bcfaed43441c7bb6149563ec11f756739c9f6a",
    },
    status: true,
    updated: 1776379432,
  },
]

const optout2: Optout[] = [
  {
    delegate: {
      id: "0x00000000000000000000000053bcfaed43441c7bb6149563ec11f756739c9f6a",
    },
    status: false,
    updated: 1376379432,
  },
]
const optout3: Optout[] = [
  {
    delegate: {
      id: "0x00000000000000000000000053bcfaed43441c7bb6149563ec11f756739c9f6a",
    },
    status: false,
    updated: 1676379432,
  },
  {
    delegate: {
      id: "0x00000000000000000000000053bcfaed43441c7bb6149563ec11f756739c9f6b",
    },
    status: true,
    updated: 1676379432,
  },
  {
    delegate: {
      id: "0x0000000000000000000000007ef021f62E3E7975FBC21d3202C5A1F19D53bB47",
    },
    status: true,
    updated: 1876379432,
  },
]

describe("the whole data transformation pipeline", () => {
  it("going going trough all the data transformers the expected output should be created", () => {
    const delegationSets = mergeDelegationSets(
      convertDelegationSetsDelegateIdsToAddress([
        delegationSets1,
        delegationSets2,
        delegationSets3,
      ]),
    )
    const optouts = mergeDelegationOptouts(
      convertOptoutsDelegateIdsToAddress([optout1, optout2, optout3]),
    )
    const optoutsRemovedDelegationSets = removeOptouts(optouts, delegationSets)

    const delegations = generateDelegationRatioMap(optoutsRemovedDelegationSets)

    const expected = {
      "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190": {
        "0x67A16655c1c46f8822726e989751817c49f29054": {
          numerator: 40,
          denominator: 40,
        },
      },
      // "0x7ef021f62E3E7975FBC21d3202C5A1F19D53bB47": {
      //   "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190": {
      //     numerator: "4",
      //     denominator: "17",
      //   },
      // },
      "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905": {
        "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190": {
          numerator: 13,
          denominator: 13,
        },
        "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A": {
          numerator: 6,
          denominator: 9,
        },
      },
      "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8": {
        "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A": {
          numerator: 3,
          denominator: 9,
        },
      },
    }

    expect(delegations).to.deep.equal(expected)
  })
})
