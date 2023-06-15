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
    fromAccount: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [
      {
        toAccount: {
          id: "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190",
        },
        numerator: 400,
      },
      {
        toAccount: {
          id: "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8",
        },
        numerator: 500,
      },
    ],
    expireTimestamp: 1876538446,
    denominator: 900,
    creationTimestamp: 1676549720,
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
        numerator: 1,
      },
    ],
    expireTimestamp: 1876538446,
    denominator: 40,
    creationTimestamp: 1676539571,
  },
  {
    fromAccount: { id: "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190" },
    delegations: [
      {
        toAccount: {
          id: "0x7ef021f62E3E7975FBC21d3202C5A1F19D53bB47",
        },
        numerator: 4,
      },
      {
        toAccount: {
          id: "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905",
        },
        numerator: 13,
      },
    ],
    expireTimestamp: 1776538446,
    denominator: 17,
    creationTimestamp: 1676539116,
  },
  {
    fromAccount: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [],
    expireTimestamp: 1776538446,
    denominator: 8,
    creationTimestamp: 1776538828,
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
        numerator: 40,
      },
    ],
    expireTimestamp: 1876538446,
    denominator: 40,
    creationTimestamp: 1676539572,
  },
  {
    fromAccount: { id: "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A" },
    delegations: [
      {
        toAccount: {
          id: "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8",
        },
        numerator: 3,
      },
      {
        toAccount: {
          id: "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905",
        },
        numerator: 6,
      },
    ],
    expireTimestamp: 500,
    denominator: 9,
    creationTimestamp: 1676379552,
  },
  {
    fromAccount: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [
      {
        toAccount: {
          id: "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190",
        },
        numerator: 1,
      },
      {
        toAccount: {
          id: "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8",
        },
        numerator: 1,
      },
    ],
    expireTimestamp: 1876538446,
    denominator: 900,
    creationTimestamp: 1676549721,
  },
]

const optout1: Optout[] = [
  {
    account: {
      id: "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A",
    },
    status: true,
    creationTimestamp: 1776379432,
  },
]

const optout2: Optout[] = [
  {
    account: {
      id: "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A",
    },
    status: false,
    creationTimestamp: 1376379432,
  },
]
const optout3: Optout[] = [
  {
    account: {
      id: "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A",
    },
    status: false,
    creationTimestamp: 1676379432,
  },
  {
    account: {
      id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6b",
    },
    status: true,
    creationTimestamp: 1676379432,
  },
  {
    account: {
      id: "0x7ef021f62E3E7975FBC21d3202C5A1F19D53bB47",
    },
    status: true,
    creationTimestamp: 1876379432,
  },
]

describe("the whole data transformation pipeline", () => {
  it("going going trough all the data transformers the expected output should be created", () => {
    const delegationSets = mergeDelegationSets(
      convertDelegationSetsDelegateIdsToAddress([
        ...delegationSets1,
        ...delegationSets2,
        ...delegationSets3,
      ]),
    )
    const optouts = mergeDelegationOptouts(
      convertOptoutsDelegateIdsToAddress([...optout1, ...optout2, ...optout3]),
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
