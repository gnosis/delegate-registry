const { EIP2470SingletonFactory } = require('@gnosis.pm/singleton-deployer-eip2470-factory');
const { Web3jsProvider } = require('@gnosis.pm/singleton-deployer-web3js-provider');
const { TruffleSingletonDeployer } = require('@gnosis.pm/singleton-deployer-truffle');

const truffleDeployer = (web3) => {
    const provider = new Web3jsProvider(web3)
    const factory = new EIP2470SingletonFactory(provider)
    return new TruffleSingletonDeployer(factory, provider)
}

const deployTruffleContract = async (web3, artifact, ...args) => {
    return await truffleDeployer(web3).deployWithArgs(artifact, args)
}

const DelegateRegistry = artifacts.require("./DelegateRegistry.sol");

module.exports = (d) => d.then(async () => {
    await deployTruffleContract(web3, DelegateRegistry);
});
