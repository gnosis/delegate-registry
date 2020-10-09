const ethUtil = require('ethereumjs-util')
const { checkTxEvent, formatAddress } = require('@gnosis.pm/safe-contracts/test/utils/general')
const abi = require('ethereumjs-abi')

const DelegateRegistry = artifacts.require("./DelegateRegistry.sol")

contract('DelegateRegistry - With EOA', (accounts) => {

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

    it('set and clear delegate, same id', async () => {
        const setTx = await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_1, { from: accounts[0]})
        const setEvent = checkTxEvent(setTx, 'SetDelegate', registry.address, true, "Set Delegate")
        assert.equal(setEvent.args.delegator, formatAddress(accounts[0]))
        assert.equal(setEvent.args.id, "0x" + TEST_ID_1.toString("hex"))
        assert.equal(setEvent.args.delegate, TEST_DELEGATE_1)
        assert.equal(setEvent.args.previousDelegate, ZERO_ADDRESS)

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), TEST_DELEGATE_1)
        
        // Reset delegate
        const clearTx = await registry.clearDelegate(TEST_ID_1, { from: accounts[0]})
        const clearEvent = checkTxEvent(clearTx, 'ClearDelegate', registry.address, true, "Clear Delegate")
        assert.equal(clearEvent.args.delegator, formatAddress(accounts[0]))
        assert.equal(clearEvent.args.id, "0x" + TEST_ID_1.toString("hex"))
        assert.equal(clearEvent.args.previousDelegate, TEST_DELEGATE_1)

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), ZERO_ADDRESS)
    })

    it('set and overwrite delegate, same id', async () => {
        const setTx = await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_1, { from: accounts[0]})
        const setEvent = checkTxEvent(setTx, 'SetDelegate', registry.address, true, "Set Delegate")
        assert.equal(setEvent.args.delegator, formatAddress(accounts[0]))
        assert.equal(setEvent.args.id, "0x" + TEST_ID_1.toString("hex"))
        assert.equal(setEvent.args.delegate, TEST_DELEGATE_1)
        assert.equal(setEvent.args.previousDelegate, ZERO_ADDRESS)

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), TEST_DELEGATE_1)

        // Overwrite delegate
        const overwriteTx = await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_2, { from: accounts[0]})
        const overwriteEvent = checkTxEvent(overwriteTx, 'SetDelegate', registry.address, true, "Overwrite Delegate")
        assert.equal(overwriteEvent.args.delegator, formatAddress(accounts[0]))
        assert.equal(overwriteEvent.args.id, "0x" + TEST_ID_1.toString("hex"))
        assert.equal(overwriteEvent.args.delegate, TEST_DELEGATE_2)
        assert.equal(overwriteEvent.args.previousDelegate, TEST_DELEGATE_1)

        // TODO: check event
        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), TEST_DELEGATE_2)
    })

    it('set and clear delegates, multiple ids', async () => {
        const setTx1 = await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_1, { from: accounts[0]})
        const setEvent1 = checkTxEvent(setTx1, 'SetDelegate', registry.address, true, "Set Delegate 1")
        assert.equal(setEvent1.args.delegator, formatAddress(accounts[0]))
        assert.equal(setEvent1.args.id, "0x" + TEST_ID_1.toString("hex"))
        assert.equal(setEvent1.args.delegate, TEST_DELEGATE_1)
        assert.equal(setEvent1.args.previousDelegate, ZERO_ADDRESS)

        const setTx2 = await registry.setDelegate(TEST_ID_2, TEST_DELEGATE_2, { from: accounts[0]})
        const setEvent2 = checkTxEvent(setTx2, 'SetDelegate', registry.address, true, "Set Delegate 2")
        assert.equal(setEvent2.args.delegator, formatAddress(accounts[0]))
        assert.equal(setEvent2.args.id, "0x" + TEST_ID_2.toString("hex"))
        assert.equal(setEvent2.args.delegate, TEST_DELEGATE_2)
        assert.equal(setEvent2.args.previousDelegate, ZERO_ADDRESS)

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), TEST_DELEGATE_1)
        assert.equal(await registry.delegation(accounts[0], TEST_ID_2), TEST_DELEGATE_2)
        
        // Reset delegate for first id
        const clearTx1 = await registry.clearDelegate(TEST_ID_1, { from: accounts[0]})
        const clearEvent1 = checkTxEvent(clearTx1, 'ClearDelegate', registry.address, true, "Clear Delegate 1")
        assert.equal(clearEvent1.args.delegator, formatAddress(accounts[0]))
        assert.equal(clearEvent1.args.id, "0x" + TEST_ID_1.toString("hex"))
        assert.equal(clearEvent1.args.previousDelegate, TEST_DELEGATE_1)

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), ZERO_ADDRESS)
        assert.equal(await registry.delegation(accounts[0], TEST_ID_2), TEST_DELEGATE_2)
        
        // Reset delegate for second id
        const clearTx2 = await registry.clearDelegate(TEST_ID_2, { from: accounts[0]})
        const clearEvent2 = checkTxEvent(clearTx2, 'ClearDelegate', registry.address, true, "Clear Delegate 2")
        assert.equal(clearEvent2.args.delegator, formatAddress(accounts[0]))
        assert.equal(clearEvent2.args.id, "0x" + TEST_ID_2.toString("hex"))
        assert.equal(clearEvent2.args.previousDelegate, TEST_DELEGATE_2)

        assert.equal(await registry.delegation(accounts[0], TEST_ID_1), ZERO_ADDRESS)
        assert.equal(await registry.delegation(accounts[0], TEST_ID_2), ZERO_ADDRESS)
    })
})
