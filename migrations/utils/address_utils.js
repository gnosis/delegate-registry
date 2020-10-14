const web3 = require('web3');

const buildCreate2Address = (deployer, salt, bytecode) => {
    return web3.utils.toChecksumAddress(`0x${web3.utils.soliditySha3(
        { t: 'bytes', v: '0xff' },
        { t: 'address', v: deployer },
        { t: 'bytes32', v: salt },
        { t: 'bytes32', v: web3.utils.keccak256(bytecode) }
    ).slice(-40)}`);
}

Object.assign(exports, {
    buildCreate2Address,
})