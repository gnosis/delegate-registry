# Delegate Registry v2

A general-purpose delegate registry.

## Features

- Transitive delegation
- Delegate to multiple addresses (specify the percentage of your vote-weight for each).
- Its possible to set expiry time for a delegation set.
- Automatic vote weight adjustment based on token balance changes.
- Delegation revocation at any time.

## Packages

### Backend

The `backend` package is responsible for computing, caching and exposing each address's delegated voting power. It provides a set of API endpoints that allow you to interact with the delegate registry. For more information on the available endpoints and how to use them, see [the example requests](packages/backend/example-requests).

### EVM

The `evm` package contains the Ethereum Virtual Machine (EVM) contracts for the delegate registry. These contracts are written in Solidity and can be deployed to any EVM-compatible blockchain. The package also includes a Hardhat configuration for compiling the contracts and running tests, as well as scripts for deploying the contracts and interacting with them on a blockchain.

### Subgraph

The `subgraph` package is responsible for indexing the contracts related to the delegate registry and expose it for the backend. It uses The Graph.
