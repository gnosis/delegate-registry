Delegate Registry
=================

[![Build Status](https://travis-ci.org/gnosis/safe-contracts.svg?branch=development)](https://travis-ci.org/gnosis/delegate-registry)

Install
-------
### Install requirements with yarn:

```bash
yarn
```

### Run all tests (requires Node version >=7 for `async/await`):

```bash
yarn truffle compile
yarn test
```

`yarn test` will start a ganache-cli with the correct configuration. If you want to run `yarn truffle test` you need to start a [ganache-cli](https://github.com/trufflesuite/ganache-cli) instance.

### Deploy

Preparation:
- Set `INFURA_TOKEN` in `.env`
- Set `NETWORK` in `.env`
- Run `yarn truffle compile`

Truffle:
- Set `MNEMONIC` in `.env`

```bash
yarn truffle deploy
```

### Verify contract

Note: To completely replicate the bytecode that has been deployed it is required that the project path is `/delegate-registry` this can be archived using `sudo mkdir /delegate-registry && sudo mount -B <your_repo_path> /delegate-registry`. Make sure the run `yarn` again if the path has been changed after the initial `yarn install`. If you use a different path you will only get partial matches.

You can locally verify contract using the scripts `generate_meta.js` and `verify_deployment.js`.

With `node scripts/generate_meta.js` a `meta` folder is created in the `build` folder that contains all files required to verify the source code on https://verification.komputing.org/ and https://etherscan.io/

For Etherscan only the `DelegateRegistryEtherscan.json` file is required. For sourcify the `DelegateRegistryMeta.json` and all the `.sol` files are required.

Once the meta data has been generated you can verify that your local compiled code corresponds to the version deployed by Gnosis with `yarn do <network> scripts/verify_deployment.js`.

Documentation
-------------
- [Coding guidelines](docs/guidelines.md)

Audits/ Formal Verification
---------
- TBD

Security and Liability
----------------------
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

License
-------
All smart contracts are released under LGPL v.3.

Contributors
------------
- Richard Meissner ([rmeissner](https://github.com/rmeissner))
- Auryn Macmillan ([auryn-macmillan](https://github.com/auryn-macmillan))
