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
      delegate:
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      ratio: 6,
    },
  ]
  const multipleDelegation = [
    {
      delegate:
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      ratio: 16,
    },
    {
      delegate:
        "0x0000000000000000000000000000000000000000000000000000000000000002",
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
      expect(delegation.delegation[0].delegate).to.equal(
        singleDelegation[0].delegate
      )
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
      expect(delegation.delegation[0].delegate).to.equal(
        multipleDelegation[0].delegate
      )
      expect(delegation.delegation[0].ratio).to.equal(
        multipleDelegation[0].ratio
      )
      expect(delegation.delegation[1].delegate).to.equal(
        multipleDelegation[1].delegate
      )
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
      expect(delegation.delegation[0].delegate).to.equal(
        multipleDelegation[0].delegate
      )
      expect(delegation.delegation[0].ratio).to.equal(
        multipleDelegation[0].ratio
      )
      expect(delegation.delegation[1].delegate).to.equal(
        multipleDelegation[1].delegate
      )
      expect(delegation.delegation[1].ratio).to.equal(
        multipleDelegation[1].ratio
      )
      expect(delegation.expirationTimestamp).to.equal(42)

      singleDelegation[0].delegate =
        "0x0000000000000000000000000000000000000000000000000000000000000003"
      await delegateRegistry.setDelegation("id", singleDelegation, 42)
      const secondDelegation = await delegateRegistry.getDelegation(
        "id",
        wallet.address
      )
      expect(secondDelegation.delegation[0].delegate).to.equal(
        singleDelegation[0].delegate
      )
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
    it("Reverts with DuplicateDelegate() if duplicate delegates are provided", async () => {
      const { delegateRegistry, multipleDelegation, wallet } = await setup()
      multipleDelegation[1].delegate =
        "0x0000000000000000000000000000000000000000000000000000000000000001"
      expect(
        delegateRegistry.setDelegation("id", multipleDelegation, 42)
      ).to.be.revertedWithCustomError(delegateRegistry, "InvalidDelegateID")
    })
    it("Reverts with DuplicateDelegate() if delegate 0x0 is provided", async () => {
      const { delegateRegistry, multipleDelegation, wallet } = await setup()
      multipleDelegation[1].delegate =
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      expect(
        delegateRegistry.setDelegation("id", multipleDelegation, 42)
      ).to.be.revertedWithCustomError(delegateRegistry, "InvalidDelegateID")
    })
  })

  describe("clearDelegation()", function () {
    it("Clears delegation in a given context", async () => {
      const { delegateRegistry, singleDelegation, wallet } = await setup()
      await delegateRegistry.setDelegation("id", singleDelegation, 42)
      let delegation = await delegateRegistry.getDelegation(
        "id",
        wallet.address
      )
      expect(delegation.delegation[0].delegate).to.equal(
        singleDelegation[0].delegate
      )
      expect(delegation.delegation[0].ratio).to.equal(singleDelegation[0].ratio)
      expect(delegation.expirationTimestamp).to.equal(42)
      await delegateRegistry.clearDelegation("id")
      delegation = await delegateRegistry.getDelegation("id", wallet.address)
      expect(delegation.delegation.length).to.equal(0)
      expect(delegation.expirationTimestamp).to.equal(0)
    })
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
      expect(delegation.delegation[0].delegate).to.equal(
        singleDelegation[0].delegate
      )
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
      expect(delegation.delegation[0].delegate).to.equal(
        singleDelegation[0].delegate
      )
      expect(delegation.delegation[0].ratio).to.equal(singleDelegation[0].ratio)
      expect(delegation.expirationTimestamp).to.equal(42)
      expect(secondDelegation.delegation[0].delegate).to.equal(
        singleDelegation[0].delegate
      )
      expect(secondDelegation.delegation[0].ratio).to.equal(
        singleDelegation[0].ratio
      )
      expect(secondDelegation.expirationTimestamp).to.equal(1337)
    })
  })

  describe("optout()", function () {
    it("Allows a delegate to set their opt-out status", async () => {
      const { delegateRegistry, wallet } = await setup()
      await delegateRegistry.optout("id", true)
      expect(await delegateRegistry.optouts(wallet.address, "id")).to.equal(
        true
      )
      await delegateRegistry.optout("id", false)
      expect(await delegateRegistry.optouts(wallet.address, "id")).to.equal(
        false
      )
    })
    it("Reverts if status equals currents status", async () => {
      const { delegateRegistry, wallet } = await setup()
      await delegateRegistry.optout("id", true)
      expect(await delegateRegistry.optouts(wallet.address, "id")).to.equal(
        true
      )
      await expect(delegateRegistry.optout("id", true))
        .to.be.revertedWithCustomError(
          delegateRegistry,
          "DuplicateOptoutStatus"
        )
        .withArgs(delegateRegistry.address, "id", true)
    })
  })
})
