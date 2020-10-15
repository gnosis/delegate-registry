Delegate Registry
=================

[![Build Status](https://travis-ci.com/gnosis/delegate-registry.svg?branch=master)](https://travis-ci.com/gnosis/delegate-registry)

Install
-------
### Install requirements with yarn:

```bash
yarn
// Setup env
cp .env.sample .env
```

### Build contracts

With docker:
```bash
docker-compose up
```

Without docker:
```bash
yarn compile
```

### Run all tests (requires Node version >=7 for `async/await`):

Running the tests with docker:

```bash
docker build -t delegate-registry .
docker run delegate-registry yarn test
```

If you want to run it without docker:

```bash
yarn compile
yarn test
```

In this case it is expected that the deployment check test fails.

### Deploy

Docker is used to ensure that always the same bytecode is generated.

Preparation:
- Set `INFURA_TOKEN` in `.env`
- Set `NETWORK` in `.env`

Deploying with docker (should always result in the same registry address):

```bash
docker build -t delegate-registry .
docker run delegate-registry yarn deploy
```

If you want to run it without docker (might result in different registry address):

```bash
yarn compile
yarn deploy
```

### Verify contract

Note: To completely replicate the bytecode that has been deployed it is required that the project path is always the same. For this use the provided Dockerfile and map the the build folder into your local build folder. For this a docker-compose file is provided which can be used with:
```bash
docker-compose up
```

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
