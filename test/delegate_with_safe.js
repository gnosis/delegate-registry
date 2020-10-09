const ethUtil = require('ethereumjs-util')
const safeUtils = require('@gnosis.pm/safe-contracts/test/utils/general')
const { checkTxEvent, formatAddress } = safeUtils

const truffleContract = require("@truffle/contract")

// Create GnosisSafe truffle contract
const GnosisSafeBuildInfo = require("@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json")
const GnosisSafe = truffleContract(GnosisSafeBuildInfo)
GnosisSafe.setProvider(web3.currentProvider)

// Create GnosisSafeProxy truffle contract
const GnosisSafeProxyBuildInfo = require("@gnosis.pm/safe-contracts/build/contracts/GnosisSafeProxy.json")
const GnosisSafeProxy = truffleContract(GnosisSafeProxyBuildInfo)
GnosisSafeProxy.setProvider(web3.currentProvider)

const DelegateRegistry = artifacts.require("./DelegateRegistry.sol")

contract('DelegateRegistry - With Safe', (accounts) => {

    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
    const TEST_DELEGATE_1 = "0x0000000000000000000000000000000000baDDAd"
    const TEST_DELEGATE_2 = "0x0000000000000000000000000000000000BADbed"
    const TEST_ID_1 = ethUtil.keccak("test_1_project")
    const TEST_ID_2 = ethUtil.keccak("test_2_project")

    let lw
    let registry
    let gnosisSafe

    beforeEach(async () => {
        lw = await safeUtils.createLightwallet()

        // Deploy Registry
        registry = await DelegateRegistry.new()

        // Create a Safe
        const gnosisSafeMasterCopy = await GnosisSafe.new({ from: accounts[0] })
        const proxy = await GnosisSafeProxy.new(gnosisSafeMasterCopy.address, { from: accounts[0] })
        gnosisSafe = await GnosisSafe.at(proxy.address)

        await gnosisSafe.setup([lw.accounts[0], lw.accounts[1], accounts[1]], 2, ZERO_ADDRESS, "0x", ZERO_ADDRESS, ZERO_ADDRESS, 0, ZERO_ADDRESS, { from: accounts[0] })
    })

    let execTransaction = async function(to, data, message) {
        let nonce = await gnosisSafe.nonce()
        let transactionHash = await gnosisSafe.getTransactionHash(to, 0, data, 0, 0, 0, 0, ZERO_ADDRESS, ZERO_ADDRESS, nonce)
        let sigs = safeUtils.signTransaction(lw, [lw.accounts[0], lw.accounts[1]], transactionHash)
        let tx = await gnosisSafe.execTransaction(to, 0, data, 0, 0, 0, 0, ZERO_ADDRESS, ZERO_ADDRESS, sigs, { from: accounts[0] })
        safeUtils.logGasUsage(
            'execTransaction ' + message,
            tx
        )
        return tx
    }

    it('set and clear delegate, same id', async () => {
        await execTransaction(
            registry.address,
            await registry.contract.methods.setDelegate(TEST_ID_1, TEST_DELEGATE_1).encodeABI(),
            "Set Delegate"
        )

        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_1), TEST_DELEGATE_1)
        
        // Reset delegate
        await execTransaction(
            registry.address,
            await registry.contract.methods.clearDelegate(TEST_ID_1).encodeABI(),
            "Set Delegate"
        )

        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_1), ZERO_ADDRESS)
    })

    it('set and overwrite delegate, same id', async () => {
        await execTransaction(
            registry.address,
            await registry.contract.methods.setDelegate(TEST_ID_1, TEST_DELEGATE_1).encodeABI(),
            "Set Delegate"
        )

        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_1), TEST_DELEGATE_1)
        
        // Overwrite delegate
        await execTransaction(
            registry.address,
            await registry.contract.methods.setDelegate(TEST_ID_1, TEST_DELEGATE_2).encodeABI(),
            "Overwrite Delegate"
        )

        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_1), TEST_DELEGATE_2)
    })

    it('set and clear delegates, multiple ids', async () => {
        await execTransaction(
            registry.address,
            await registry.contract.methods.setDelegate(TEST_ID_1, TEST_DELEGATE_1).encodeABI(),
            "Set Delegate"
        )
        await execTransaction(
            registry.address,
            await registry.contract.methods.setDelegate(TEST_ID_2, TEST_DELEGATE_2).encodeABI(),
            "Set Delegate"
        )

        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_1), TEST_DELEGATE_1)
        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_2), TEST_DELEGATE_2)
        
        // Reset delegate for first id
        // Reset delegate
        await execTransaction(
            registry.address,
            await registry.contract.methods.clearDelegate(TEST_ID_1).encodeABI(),
            "Clear Delegate"
        )

        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_1), ZERO_ADDRESS)
        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_2), TEST_DELEGATE_2)
        
        // Reset delegate for second id
        // Reset delegate
        await execTransaction(
            registry.address,
            await registry.contract.methods.clearDelegate(TEST_ID_2).encodeABI(),
            "Clear Delegate"
        )

        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_1), ZERO_ADDRESS)
        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_2), ZERO_ADDRESS)
    })

    it('set delegates, eoa and Safe', async () => {
        await execTransaction(
            registry.address,
            await registry.contract.methods.setDelegate(TEST_ID_1, TEST_DELEGATE_1).encodeABI(),
            "Set Delegate"
        )
        safeUtils.logGasUsage(
            'Set Delegate with TEST_ID_1 and TEST_DELEGATE_2',
            await registry.setDelegate(TEST_ID_1, TEST_DELEGATE_2, { from: accounts[8]})
        )
        safeUtils.logGasUsage(
            'Set Delegate with TEST_ID_2 and TEST_DELEGATE_2',
            await registry.setDelegate(TEST_ID_2, TEST_DELEGATE_2, { from: accounts[8]})
        )

        assert.equal(await registry.delegation(gnosisSafe.address, TEST_ID_1), TEST_DELEGATE_1)
        assert.equal(await registry.delegation(accounts[8], TEST_ID_1), TEST_DELEGATE_2)
        assert.equal(await registry.delegation(accounts[8], TEST_ID_2), TEST_DELEGATE_2)
    })
})
