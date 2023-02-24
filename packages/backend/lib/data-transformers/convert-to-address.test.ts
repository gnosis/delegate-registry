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
    account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
    delegations: [
      {
        delegate: {
          id: "0x0000000000000000000000006cc5b30cd0a93c1f85c7868f5f2620ab8c458190",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: "400",
      },
      {
        delegate: {
          id: "0x000000000000000000000000d714dd60e22bbb1cbafd0e40de5cfa7bbdd3f3c8",
        },
        account: { id: "0xd028d504316fec029cfa36bdc3a8f053f6e5a6e4" },
        numerator: "500",
      },
    ],
    expiration: "1876538446",
    denominator: "900",
    delegationUpdated: "1676549720",
    expirationUpdated: "1676549720",
  }
  describe("convertDelegationSetDelegateIdsToAddress", () => {
    it("should return the same delegation sets as provided", () => {
      const updatedDelegationSet =
        convertDelegationSetAddressesToAddress(delegationSet)

      expect({
        ...R.omit(["account"], updatedDelegationSet),
        delegations: R.map(
          R.omit(["delegate", "account"]),
          updatedDelegationSet.delegations,
        ),
      }).to.deep.equal({
        ...R.omit(["account"], delegationSet),
        delegations: R.map(
          R.omit(["delegate", "account"]),
          delegationSet.delegations,
        ),
      })

      expect(updatedDelegationSet.delegations[0].delegate.id).to.equal(
        getAddress(delegationSet.delegations[0].delegate.id.slice(-40)),
      )

      expect(updatedDelegationSet.delegations[1].delegate.id).to.equal(
        getAddress(delegationSet.delegations[1].delegate.id.slice(-40)),
      )

      expect(updatedDelegationSet.account.id).to.equal(
        getAddress(delegationSet.account.id),
      )

      expect(updatedDelegationSet.delegations[0].account.id).to.equal(
        getAddress(delegationSet.delegations[0].account.id),
      )

      expect(updatedDelegationSet.delegations[1].account.id).to.equal(
        getAddress(delegationSet.delegations[1].account.id),
      )
    })
  })

  describe("convertOptoutDelegateIdToAddress", () => {
    const optout: Optout = {
      delegate: {
        id: "0x00000000000000000000000053bcfaed43441c7bb6149563ec11f756739c9f6a",
      },
      status: true,
      updated: "1776379432",
    }

    it("should return the same delegation sets as provided", () => {
      const updatedOptout = convertOptoutDelegateIdToAddress(optout)

      expect(updatedOptout).to.deep.equal({
        ...optout,
        delegate: {
          id: getAddress(updatedOptout.delegate.id.slice(-40)),
        },
      })
    })
  })
})
