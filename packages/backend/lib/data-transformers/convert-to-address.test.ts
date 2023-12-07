import "mocha"
import { expect } from "chai"
import { DelegationSet, Optout } from "../../types"
import {
  convertDelegationSetAddressesToAddress,
  convertOptoutDelegateIdToAddress,
} from "./convert-to-address"
import R from "ramda"
import { getAddress } from "ethers/lib/utils"

describe("convert-to-address.test", () => {
  const delegationSet: DelegationSet = {
    fromAccount: {
      id: "0xD028d504316FEc029CFa36bdc3A8f053F6E5a6e4",
    },
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
  }
  describe("convertDelegationSetDelegateIdsToAddress", () => {
    it("should return the same delegation sets as provided", () => {
      const updatedDelegationSet =
        convertDelegationSetAddressesToAddress(delegationSet)

      expect({
        ...R.omit(["account"], updatedDelegationSet),
        delegations: R.map(
          R.omit(["delegate", "account"]),
          updatedDelegationSet.delegations ?? [],
        ),
      }).to.deep.equal({
        ...R.omit(["account"], delegationSet),
        delegations: R.map(
          R.omit(["delegate", "account"]),
          delegationSet.delegations ?? [],
        ),
      })

      if (updatedDelegationSet.delegations == null) {
        throw new Error("delegation set delegations should not be null")
      }

      if (delegationSet?.delegations == null) {
        throw new Error("delegation set should not be null")
      }

      expect(updatedDelegationSet.delegations[0].toAccount.id).to.equal(
        getAddress(delegationSet.delegations[0].toAccount.id),
      )

      expect((updatedDelegationSet.delegations ?? [])[1].toAccount.id).to.equal(
        getAddress(delegationSet.delegations[1].toAccount.id),
      )

      expect(updatedDelegationSet.fromAccount.id).to.equal(
        getAddress(delegationSet.fromAccount.id),
      )

      expect(updatedDelegationSet.delegations[0].toAccount.id).to.equal(
        getAddress(delegationSet.delegations[0].toAccount.id),
      )

      expect(updatedDelegationSet.delegations[1].toAccount.id).to.equal(
        getAddress(delegationSet.delegations[1].toAccount.id),
      )
    })
  })

  describe("convertOptoutDelegateIdToAddress", () => {
    const optout: Optout = {
      account: {
        id: getAddress("0x53bcFaEd43441C7bB6149563eC11f756739C9f6A"),
      },
      status: true,
      creationTimestamp: "1776379432",
    }

    it("should return the same delegation sets as provided", () => {
      const updatedOptout = convertOptoutDelegateIdToAddress(optout)
      const expected: Optout = {
        ...optout,
        account: {
          id: getAddress(updatedOptout.account.id),
        },
      }
      expect(updatedOptout).to.deep.equal(expected)
    })
  })
})
