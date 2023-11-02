import "mocha"
import { expect } from "chai"
import { fetchDelegationSetsFromV1 } from "../../data"

describe("fetchDelegationSetsFromV1", () => {
  it("should do something that takes a long time", async function () {
    this.timeout(10000) // Set timeout to 5 seconds
    // Your test code here
    const chainId = 1
    const spaceName = "gnosis.eth"
    const result = await fetchDelegationSetsFromV1(spaceName, chainId)

    console.log("result:", result)
    expect(result).to.be.an("array").that.is.not.empty
    expect(result[0]).to.have.property("denominator").equal("1")
    expect(result[0]).to.have.property("creationTimestamp").equal("0")
    expect(result[0].fromAccount.id).to.be.a("string").that.is.not.empty
    expect(result[0]).to.have.property("delegations").that.is.an("array").that
      .is.not.empty
  })
})
