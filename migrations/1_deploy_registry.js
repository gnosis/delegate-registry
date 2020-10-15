const { deployTruffleContract } = require('./utils/singleton_factory');

const DelegateRegistry = artifacts.require("./DelegateRegistry.sol");

module.exports = (d) => d.then(async () => {
    await deployTruffleContract(web3, DelegateRegistry);
});
