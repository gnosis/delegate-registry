const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()
const package = require('./package')
const mnemonic = process.env.MNEMONIC
const token = process.env.INFURA_TOKEN

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/' + token)
      },
      network_id: '4',
      gasPrice: 25000000000, // 25 Gwei
    },
    goerli: {
      provider: () => {
        return new HDWalletProvider(mnemonic, 'https://goerli.infura.io/v3/' + token)
      },
      network_id: '5',
      gasPrice: 25000000000, // 25 Gwei
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(mnemonic, 'https://kovan.infura.io/v3/' + token)
      },
      network_id: '42',
      gasPrice: 25000000000, // 25 Gwei
    },
    mainnet: {
      provider: () => {
        return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/v3/' + token)
      },
      network_id: '1',
      gasPrice: 32000000000, // 32 Gwei
    },
    xdai: {
      provider: () => {
        return new HDWalletProvider(mnemonic, 'https://dai.poa.network')
      },
      network_id: '100',
      gasPrice: 1000000000, // 1 Gwei
    },
    volta: {
      provider: () => {
        return new HDWalletProvider(mnemonic, 'https://volta-rpc.energyweb.org')
      },
      network_id: '73799',
      gasPrice: 1
    },
    ewc: {
      provider: () => {
        return new HDWalletProvider(mnemonic, 'https://rpc.energyweb.org')
      },
      network_id: '246',
      gasPrice: 1
    }
  },
  compilers: {
    solc: {
      version: package.dependencies.solc,
      settings: {
        optimizer: {
          enabled: false
        },
        evmVersion: "petersburg"
      }
    }
  },
  plugins: ["solidity-coverage"]
};
