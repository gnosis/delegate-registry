var DelegateRegistry = artifacts.require("./DelegateRegistry.sol");

module.exports = function(deployer) {
    deployer.deploy(DelegateRegistry)
};
