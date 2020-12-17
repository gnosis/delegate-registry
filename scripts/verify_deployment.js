/*
Set INFURA_TOKEN in .env
Run with `yarn do rinkeby scripts/simulate_verify.js`
*/

const solc = require('solc')
const path = require('path')
const fs = require('fs')

const metaDir = path.join("build", "meta")

function reformatMetadata(
    metadata,
    sources
) {

    const input = {};
    let fileName = '';
    let contractName = '';

    input.settings = metadata.settings;

    for (fileName in metadata.settings.compilationTarget) {
        contractName = metadata.settings.compilationTarget[fileName];
    }

    delete input['settings']['compilationTarget']

    if (contractName == '') {
        const err = new Error("Could not determine compilation target from metadata.");
        console.log({ loc: '[REFORMAT]', err: err });
        throw err;
    }

    input['sources'] = {}
    for (const source in sources) {
        let content = sources[source].content
        if (!content) {
            const pathParts = source.split("/")
            content = fs.readFileSync(path.join(metaDir, pathParts[pathParts.length - 1])).toString()
        }
        input.sources[source] = { content }
    }

    input.language = metadata.language
    input.settings.metadata = input.settings.metadata || {}
    input.settings.outputSelection = input.settings.outputSelection || {}
    input.settings.outputSelection[fileName] = input.settings.outputSelection[fileName] || {}

    input.settings.outputSelection[fileName][contractName] = [
        'evm.bytecode',
        'evm.deployedBytecode',
        'metadata'
    ];

    return {
        input: input,
        fileName: fileName,
        contractName: contractName
    }
}

process = async () => {
    const networkId = await web3.eth.net.getId()
    const network = require(path.join("..", "networks.json"));
    const pkg = require(path.join("..", "package.json"))
    const supportedContracts = pkg.ethereum.contracts

    for (const c of supportedContracts) {
        console.log(`Verify ${c}`)
        const meta = require(path.join("..", metaDir, `${c}Meta.json`));
        const {
            input,
            fileName,
            contractName
        } = reformatMetadata(meta, meta.sources);
        const solcjs = await new Promise((resolve, reject) => {
            solc.loadRemoteVersion(`v${meta.compiler.version}`, (error, soljson) => {
                (error) ? reject(error) : resolve(soljson);
            });
        });
        const compiled = solcjs.compile(JSON.stringify(input));
        const output = JSON.parse(compiled);
        const contract = output.contracts[fileName][contractName];
        const address = network[c][networkId]["address"]
        console.log(`Address: ${address}`)
        const onchainBytecode = await web3.eth.getCode(address);
        const onchainBytecodeHash = web3.utils.sha3(onchainBytecode)
        const localBytecodeHash = web3.utils.sha3(`0x${contract.evm.deployedBytecode.object}`)
        console.log(`On-chain bytecode hash:  ${onchainBytecodeHash}`)
        console.log(`Local bytecode hash:     ${localBytecodeHash}`)
        const verifySuccess = onchainBytecodeHash === localBytecodeHash ? "SUCCESS" : "FAILURE"
        console.log(`Verification status for ${c}: ${verifySuccess}`)
    }
}

module.exports = function (callback) {
    process()
        .then(() => { callback() })
        .catch((err) => { callback(err) })
}
