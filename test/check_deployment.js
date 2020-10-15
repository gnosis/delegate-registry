const DelegateRegistry = artifacts.require("./DelegateRegistry.sol")

contract('DelegateRegistry - Check deployment', () => {
    // Note: Skip this test when running without docker, as resulting address will be different.
    it('check that the deployment generates the correct address [ @skip-on-coverage ]', async () => {
        const registry = await DelegateRegistry.deployed()
        // This should correspond to the address in the networks.json file
        assert.equal(await registry.address, "0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015447")
    })
})
