const DelegateRegistry = artifacts.require("./DelegateRegistry.sol")

contract('DelegateRegistry - Check deployment', () => {
    // Note: Skip this test during development (this is more a sanity check)
    it('check that the deployment generates the correct address', async () => {
        const registry = await DelegateRegistry.deployed()
        // This should correspond to the address in the networks.json file
        assert.equal(await registry.address, "0x84B9a7698DA91c5E4fCcE64D92d9449E9D163Cdb")
    })
})
