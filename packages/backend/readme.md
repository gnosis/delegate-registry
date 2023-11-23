# Delegate Registry v2 - Backend

Computes and exposes the vote weight delegated. **Only the delegated voting wight is present.**

## Endpoint for retrieving a snapshot: `api/[space]/snapshot/[blocknumber]/strategy-formatted-vote-weights`

This is the endpoint used from the delegate-registry-v2 strategy.

The first time a new blocknumber / context combination in requested the compete delegation graph is computed and stored in the database, as this is a computational expensive and time consuming operation. On consecutive requests for the same blocknumber/ context combination the result is retrieved from the database.

**Only the delegated voting wight is present.** To compute the complete vote weight for an address, the result from the backend must be combined with the addresses own vote weight, like explained below:

If the returned vote weight for an address is:

- a positive number: this number is the amount delegated to that address and must be added to the address's own vote weight.
- `0`: the address is delegating its vote weight and the address's vote weight should be `0`.
- nothing: the address is not delegating and is not delegated to. The addresses own vote weight should be used as its vote weight.

For address A, the returned vote weight will be 0, for B it will be 0 and for C it will be A + B (not including its own vote weight).
Therefore A's and B's voting power must be set to 0.

## Endpoints for retrieving information about the current (latest) delegation graph

## How to set up and start

```
cd packages/backend
yarn
yarn start
```
