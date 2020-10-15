const truffleContract = require("@truffle/contract")

const { toConfirmationPromise } = require('./promise_utils');
const { buildCreate2Address } = require('./address_utils');

const SINGLETON_FACTORY = '0xce0042B868300000d44A59004Da54A005ffdcf9f'
const SINGLETON_FACTORY_DEPLOYER = '0xBb6e024b9cFFACB947A71991E386681B1Cd1477D'
const SINGLETON_FACTORY_CODE = '0xf9016c8085174876e8008303c4d88080b90154608060405234801561001057600080fd5b50610134806100206000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80634af63f0214602d575b600080fd5b60cf60048036036040811015604157600080fd5b810190602081018135640100000000811115605b57600080fd5b820183602082011115606c57600080fd5b80359060200191846001830284011164010000000083111715608d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550509135925060eb915050565b604080516001600160a01b039092168252519081900360200190f35b6000818351602085016000f5939250505056fea26469706673582212206b44f8a82cb6b156bfcc3dc6aadd6df4eefd204bc928a4397fd15dacf6d5320564736f6c634300060200331b83247000822470'
const SINGLETON_FACTORY_ABI = [
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_initCode",
                "type": "bytes"
            },
            {
                "internalType": "bytes32",
                "name": "_salt",
                "type": "bytes32"
            }
        ],
        "name": "deploy",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "createdContract",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

const requireFactoryDeployment = async (web3) => {
    return (await web3.eth.getCode(SINGLETON_FACTORY)) === '0x'
}

const deployFactory = async (web3) => {
    await toConfirmationPromise(web3.eth.sendSignedTransaction(SINGLETON_FACTORY_CODE));
}

const ensureFactory = async (web3) => {
    const [deployer] = await web3.eth.getAccounts();
    if (await requireFactoryDeployment(web3)) {
        // greetz @3esmit and @forshtat
        await toConfirmationPromise(web3.eth.sendTransaction({
            from: deployer,
            to: SINGLETON_FACTORY_DEPLOYER,
            value: 1e18
        }));
        await deployFactory(web3);
        console.log(`Deployed EIP 2470 SingletonFactory at ${SINGLETON_FACTORY}`);
    } else {
        console.log(`EIP 2470 SingletonFactory already deployed at ${SINGLETON_FACTORY}`);
    }
    const factoryContract = truffleContract({ abi: SINGLETON_FACTORY_ABI })
    factoryContract.setProvider(web3.currentProvider)
    const singletonFactory = await factoryContract.at(SINGLETON_FACTORY)
    return singletonFactory;
}

const deployContract = async (web3, bytecode, salt) => {
    const [deployer] = await web3.eth.getAccounts();
    const contractAddress = buildCreate2Address(SINGLETON_FACTORY, salt, bytecode);
    const requireDeployment = (await web3.eth.getCode(contractAddress)) === '0x';
    if (!requireDeployment) {
        return { txHash: null, newContract: false, contractAddress };
    }
    const factory = await ensureFactory(web3);
    const { tx } = await factory.deploy(bytecode, salt, { from: deployer });
    return { txHash: tx, newContract: true, contractAddress };
}

const deployTruffleContract = async (web3, artifact, salt) => {
    const artifactName = artifact.contractName || "Artifact"
    const deploymentSalt = salt || '0x';
    const { contractAddress, txHash, newContract } = await deployContract(web3, artifact.bytecode, deploymentSalt);
    if (newContract) {
        console.log(`Deployed ${artifactName} at ${contractAddress}`);

        artifact.address = contractAddress;
        artifact.transactionHash = txHash;
    } else {
        try {
            const addressOnArtifact = artifact.address;
            if (addressOnArtifact !== contractAddress) {
                console.warn(`Expected to find ${contractAddress
                    } set as ${artifactName} address but instead found ${artifact.address
                    } so the address is being updated, but the transaction hash should be manually corrected`);
            } else {
                console.log(`Found ${artifactName} at ${contractAddress}`);
            }
        } catch (e) {
            if (e.message.startsWith(`${artifactName} has no network configuration for its current network id`)) {
                console.warn(`Expected to find ${contractAddress
                    } set as ${artifactName} address but instead couldn't find an address, so the address is being updated, but the transaction hash should be manually added`);
            } else {
                throw e;
            }
        }
        artifact.address = contractAddress;
    }
}

Object.assign(exports, {
    SINGLETON_FACTORY,
    SINGLETON_FACTORY_DEPLOYER,
    SINGLETON_FACTORY_CODE,
    requireFactoryDeployment,
    deployFactory,
    ensureFactory,
    deployContract,
    deployTruffleContract,
})