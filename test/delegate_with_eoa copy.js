const ethUtil = require('ethereumjs-util')
const abi = require('ethereumjs-abi')

const DelegateRegistry = artifacts.require("./DelegateRegistry.sol")

contract('DelegateRegistry', (accounts) => {

    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
    const TEST_DELEGATE_1 = "0x0000000000000000000000000000000000baDDAd"
    const TEST_DELEGATE_2 = "0x0000000000000000000000000000000000BADbed"
    const TEST_ID_1 = ethUtil.keccak("test_1_project")
    const TEST_ID_2 = ethUtil.keccak("test_2_project")

    let registry

    beforeEach(async () => {
        // Deploy Libraries
        registry = await DelegateRegistry.new()
    })

    it('set and clear delegate, same id', async () => {
        await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_1, { from: accounts[0]})
        // TODO: check event

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), TEST_DELEGATE_1)
        
        // Reset delegate
        await registry.clearDelegate(TEST_ID_1, { from: accounts[0]})

        // TODO: check event
        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), ZERO_ADDRESS)
    })

    it('set and overwrite delegate, same id', async () => {
        await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_1, { from: accounts[0]})
        // TODO: check event

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), TEST_DELEGATE_1)
        
        // Reset delegate
        await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_2, { from: accounts[0]})

        // TODO: check event
        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), TEST_DELEGATE_2)
    })

    it('set and clear delegates, multiple ids', async () => {
        await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_1, { from: accounts[0]})
        await registry.setDelegate(TEST_ID_2, TEST_DELEGATE_2, { from: accounts[0]})

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), TEST_DELEGATE_1)
        assert.equal(await registry.delegation(accounts[0], TEST_ID_2), TEST_DELEGATE_2)
        
        // Reset delegate for first id
        await registry.clearDelegate(TEST_ID_1, { from: accounts[0]})

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), ZERO_ADDRESS)
        assert.equal(await registry.delegation(accounts[0], TEST_ID_2), TEST_DELEGATE_2)
        
        // Reset delegate for first id
        await registry.clearDelegate(TEST_ID_2, { from: accounts[0]})

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), ZERO_ADDRESS)
        assert.equal(await registry.delegation(accounts[0], TEST_ID_2), ZERO_ADDRESS)
    })
})
