import "mocha"
import { expect } from "chai"
import { removeOptouts } from "./remove-optouts"

const delegatorToDelegationSets = {
  "0x67a16655c1c46f8822726e989751817c49f29054": {
    account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
    delegations: [
      {
        delegate: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
        account: { id: "0x67a16655c1c46f8822726e989751817c49f29054" },
        numerator: 40,
      },
    ],
    expiration: 1876538446,
    denominator: 40,
    delegationUpdated: 1676539572,
    expirationUpdated: 1676539572,
  },
  "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190": {
    account: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
    delegations: [
      {
        delegate: { id: "0x7ef021f62e3e7975fbc21d3202c5a1f19d53bb47" },
        account: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
        numerator: 4,
      },
      {
        delegate: { id: "0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905" },
        account: { id: "0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190" },
        numerator: 13,
      },
    ],
    expiration: 1776538446,
    denominator: 17,
    delegationUpdated: 1676539116,
    expirationUpdated: 1676539116,
  },
  "0x53bcfaed43441c7bb6149563ec11f756739c9f6a": {
    account: { id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6a" },
    delegations: [
      {
        delegate: { id: "0xd714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8" },
        account: { id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6a" },
        numerator: 3,
      },
      {
        delegate: { id: "0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905" },
        account: { id: "0x53bcfaed43441c7bb6149563ec11f756739c9f6a" },
        numerator: 6,
      },
    ],
    expiration: 500,
    denominator: 9,
    delegationUpdated: 1676379552,
    expirationUpdated: 1676379552,
  },
}

describe("remove-optouts", () => {
  describe("removeOptouts", () => {
    it("should return the same delegationRatioMap when the optout list is empty", () => {
      const delegatorToDelegationSet = removeOptouts(
        [],
        delegatorToDelegationSets,
      )

      expect(delegatorToDelegationSet).to.deep.equal(delegatorToDelegationSets)
    })
    it("when there are two delegates in a delegation set and one delegate has opted out, all vote weight should go to the other", () => {
      const delegatorToDelegationSet = removeOptouts(
        ["0x7ef021f62e3e7975fbc21d3202c5a1f19d53bb47"],
        delegatorToDelegationSets,
      )

      expect(
        delegatorToDelegationSet["0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190"]
          .delegations[0].numerator,
      ).to.equal(
        delegatorToDelegationSet["0x6cc5b30cd0a93c1f85c7868f5f2620ab8c458190"]
          .denominator,
        "This delegator should have all their vote weight delegated to the delegate that is left, when the other delegate has opted out",
      )
    })
    it("when all delegates in a delegation set has opted out, the delegation set for that delegator should be removed", () => {
      const delegatorToDelegationSet = removeOptouts(
        [
          "0xd714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
          "0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905",
        ],
        delegatorToDelegationSets,
      )

      console.log(
        delegatorToDelegationSet["0x53bcfaed43441c7bb6149563ec11f756739c9f6a"],
      )

      expect(
        delegatorToDelegationSet["0x53bcfaed43441c7bb6149563ec11f756739c9f6a"],
      ).to.be.undefined
    })
  })
})
