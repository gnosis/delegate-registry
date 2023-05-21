import "mocha"
import { expect } from "chai"
import { removeOptouts } from "./remove-optouts"
import { DelegationSet } from "../../types"
import { ethers } from "ethers"

const { getAddress } = ethers.utils

const delegatorToDelegationSets: { [frmAccount: string]: DelegationSet } = {
  "0x67A16655c1c46f8822726e989751817c49f29054": {
    fromAccount: { id: "0x67A16655c1c46f8822726e989751817c49f29054" },
    delegations: [
      {
        toAccount: { id: "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190" },
        numerator: 40,
      },
    ],
    expireTimestamp: 1876538446,
    denominator: 40,
    creationTimestamp: 1676539572,
  },
  "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190": {
    fromAccount: { id: "0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190" },
    delegations: [
      {
        toAccount: { id: "0x7ef021f62E3E7975FBC21d3202C5A1F19D53bB47" },
        numerator: 4,
      },
      {
        toAccount: { id: "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905" },
        numerator: 13,
      },
    ],
    expireTimestamp: 1776538446,
    denominator: 17,
    creationTimestamp: 1676539116,
  },
  "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A": {
    fromAccount: { id: "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A" },
    delegations: [
      {
        toAccount: { id: "0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8" },
        numerator: 3,
      },
      {
        toAccount: { id: "0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905" },
        numerator: 6,
      },
    ],
    expireTimestamp: 500,
    denominator: 9,
    creationTimestamp: 1676379552,
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
        [getAddress("0x7ef021f62e3e7975fbc21d3202c5a1f19d53bb47")],
        delegatorToDelegationSets,
      )

      expect(
        delegatorToDelegationSet["0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190"]
          .delegations[0].numerator,
      ).to.equal(
        delegatorToDelegationSet["0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190"]
          .denominator,
        "This delegator should have all their vote weight delegated to the delegate that is left, when the other delegate has opted out",
      )
    })
    it("when all delegates in a delegation set has opted out, the delegation set for that delegator should be removed", () => {
      console.log("THE SETS")
      const delegatorToDelegationSet = removeOptouts(
        [
          getAddress("0xd714Dd60e22BbB1cbAFD0e40dE5Cfa7bBDD3F3C8"),
          getAddress("0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905"),
        ],
        delegatorToDelegationSets,
      )

      console.log(
        JSON.stringify(
          delegatorToDelegationSet[
            "0x53bcFaEd43441C7bB6149563eC11f756739C9f6A"
          ],
        ),
      )
      console.log("delegatorToDelegationSet: ", delegatorToDelegationSet)

      expect(
        delegatorToDelegationSet["0x53bcFaEd43441C7bB6149563eC11f756739C9f6A"],
      ).to.be.undefined
    })
  })
})
