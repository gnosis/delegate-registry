const { assertRejects } = require('./utils/assertions')

const ethUtil = require('ethereumjs-util')
const abi = require('ethereumjs-abi')

const DelegateRegistry = artifacts.require("./DelegateRegistry.sol")

contract('DelegateRegistry - Error Cases', (accounts) => {

    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
    const TEST_DELEGATE_1 = "0x0000000000000000000000000000000000baDDAd"
    const TEST_DELEGATE_2 = "0x0000000000000000000000000000000000BADbed"
    const TEST_ID_1 = ethUtil.keccak("test_1_project")
    const TEST_ID_2 = ethUtil.keccak("test_2_project")

    let registry

    beforeEach(async () => {
        // Deploy Registry
        registry = await DelegateRegistry.new()
    })

    it('cannot set delegate to self', async () => {
        await assertRejects(
            registry.setDelegate(TEST_ID_1, accounts[0], { from: accounts[0]}),
            "Delegate should not be msg.sender"
        )
    })

    it('cannot set delegate to 0x0', async () => {
        await assertRejects(
            registry.setDelegate(TEST_ID_1, ZERO_ADDRESS, { from: accounts[0]}),
            "Delegate should not be 0x0"
        )
    })

    it('cannot set delegate to same twice', async () => {
        await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_1, { from: accounts[0]})
        await assertRejects(
            registry.setDelegate(TEST_ID_1, TEST_DELEGATE_1, { from: accounts[0]}),
            "Delegate should not be set again"
        )
    })

    it('cannot clear unset delegate', async () => {
        await assertRejects(
            registry.clearDelegate(TEST_ID_1, { from: accounts[0]}),
            "Delegate should be set"
        )
    })

})
