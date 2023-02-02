import { expect } from "chai"
import { ethers } from "hardhat"

const setup = async () => {
  // const { tester } = await getNamedAccounts()
  // const testSigner = await ethers.getSigner(tester)
  const [wallet] = await ethers.getSigners()
  const DelegateRegistry = await ethers.getContractFactory("DelegateRegistry")
  const delegateRegistry = await DelegateRegistry.deploy()
  const singleDelegation = [
    {
      id: "0x0000000000000000000000000000000000000000000000000000000000000001",
      ratio: 6,
    },
  ]
  const multipleDelegation = [
    {
      id: "0x0000000000000000000000000000000000000000000000000000000000000001",
      ratio: 16,
    },
    {
      id: "0x0000000000000000000000000000000000000000000000000000000000000002",
      ratio: 9,
    },
  ]
  return {
    wallet,
    delegateRegistry,
    DelegateRegistry,
    singleDelegation,
    multipleDelegation,
  }
}

describe("Delegate Registry", function () {
  describe("Deploy", function () {
    it("Successfully deploys contract", async function () {
      const { delegateRegistry } = await setup()
      expect(delegateRegistry.deployed(), "something?")
    })
  })

  describe("setDelegate()", function () {
    it("Sets single delegation in a given context", async () => {
      const { delegateRegistry, singleDelegation, wallet } = await setup()
      await delegateRegistry.setDelegation("id", singleDelegation, 42)
      const delegation = await delegateRegistry.getDelegation(
        "id",
        wallet.address
      )
      expect(delegation.delegation[0].id).to.equal(singleDelegation[0].id)
      expect(delegation.delegation[0].ratio).to.equal(singleDelegation[0].ratio)
      expect(delegation.expirationTimestamp).to.equal(42)
    })
    it("Sets multiple delegations in a given context", async () => {
      const { delegateRegistry, multipleDelegation, wallet } = await setup()
      await delegateRegistry.setDelegation("id", multipleDelegation, 42)
      const delegation = await delegateRegistry.getDelegation(
        "id",
        wallet.address
      )
      expect(delegation.delegation[0].id).to.equal(multipleDelegation[0].id)
      expect(delegation.delegation[0].ratio).to.equal(
        multipleDelegation[0].ratio
      )
      expect(delegation.delegation[1].id).to.equal(multipleDelegation[1].id)
      expect(delegation.delegation[1].ratio).to.equal(
        multipleDelegation[1].ratio
      )
      expect(delegation.expirationTimestamp).to.equal(42)
    })
    it("Overwrite's previous delegation in a given context", async () => {
      const { delegateRegistry, multipleDelegation, singleDelegation, wallet } =
        await setup()
      await delegateRegistry.setDelegation("id", multipleDelegation, 42)
      const delegation = await delegateRegistry.getDelegation(
        "id",
        wallet.address
      )
      expect(delegation.delegation[0].id).to.equal(multipleDelegation[0].id)
      expect(delegation.delegation[0].ratio).to.equal(
        multipleDelegation[0].ratio
      )
      expect(delegation.delegation[1].id).to.equal(multipleDelegation[1].id)
      expect(delegation.delegation[1].ratio).to.equal(
        multipleDelegation[1].ratio
      )
      expect(delegation.expirationTimestamp).to.equal(42)

      singleDelegation[0].id =
        "0x0000000000000000000000000000000000000000000000000000000000000003"
      await delegateRegistry.setDelegation("id", singleDelegation, 42)
      const secondDelegation = await delegateRegistry.getDelegation(
        "id",
        wallet.address
      )
      expect(secondDelegation.delegation[0].id).to.equal(singleDelegation[0].id)
      expect(secondDelegation.delegation[0].ratio).to.equal(
        singleDelegation[0].ratio
      )
      expect(secondDelegation.expirationTimestamp).to.equal(42)
    })
    it("Emits SetDelegate() event with correct params", async () => {
      const { delegateRegistry, singleDelegation, wallet } = await setup()
      await expect(
        delegateRegistry.setDelegation("id", singleDelegation, 42)
      ).to.emit(delegateRegistry, "DelegationUpdated")
    })
    it("Reverts with DuplicateDelegation on duplicate delegation", async () => {
      const { delegateRegistry, singleDelegation, wallet } = await setup()
      await delegateRegistry.setDelegation("id", singleDelegation, 42)
      expect(
        delegateRegistry.setDelegation("id", singleDelegation, 42)
      ).to.be.revertedWithCustomError(delegateRegistry, "DuplicateDelegation")
    })
    it("Reverts with DuplicateDelegate() if duplicate delegates are provided")
  })

  describe("setExpiration()", function () {
    it("Sets expiration timestamp in a given context", async () => {
      const { delegateRegistry, singleDelegation, wallet } = await setup()
      await delegateRegistry.setDelegation("id", singleDelegation, 42)
      await delegateRegistry.setExpiration("id", 420)
      const delegation = await delegateRegistry.getDelegation(
        "id",
        wallet.address
      )
      expect(delegation.delegation[0].id).to.equal(singleDelegation[0].id)
      expect(delegation.delegation[0].ratio).to.equal(singleDelegation[0].ratio)
      expect(delegation.expirationTimestamp).to.equal(420)
    })
    it("Reverts with DuplicateTimestamp on duplicate expiration timestamp", async () => {
      const { delegateRegistry, singleDelegation, wallet } = await setup()
      await delegateRegistry.setDelegation("id", singleDelegation, 42)
      await expect(
        delegateRegistry.setExpiration("id", 42)
      ).to.be.revertedWithCustomError(delegateRegistry, "DuplicateTimestamp")
    })
  })

  describe("getDelegation()", function () {
    it("Returns correct delegation details for a given context and delegator", async () => {
      const { delegateRegistry, singleDelegation, wallet } = await setup()
      await delegateRegistry.setDelegation("id", singleDelegation, 42)
      await delegateRegistry.setDelegation("id2", singleDelegation, 1337)
      const delegation = await delegateRegistry.getDelegation(
        "id",
        wallet.address
      )
      const secondDelegation = await delegateRegistry.getDelegation(
        "id2",
        wallet.address
      )
      expect(delegation.delegation[0].id).to.equal(singleDelegation[0].id)
      expect(delegation.delegation[0].ratio).to.equal(singleDelegation[0].ratio)
      expect(delegation.expirationTimestamp).to.equal(42)
      expect(secondDelegation.delegation[0].id).to.equal(singleDelegation[0].id)
      expect(secondDelegation.delegation[0].ratio).to.equal(
        singleDelegation[0].ratio
      )
      expect(secondDelegation.expirationTimestamp).to.equal(1337)
    })
  })
})
