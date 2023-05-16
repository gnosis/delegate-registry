# Delegate Registry

A general-purpose delegate registry.

## Backend

Computes and exposes each addresses delegated voting power.

To see the available endpoints and how to interact with them, see [the example requests](packages/backend/example-requests).

```
cd packages/backend
yarn
yarn start
```

## ToDo

This only computes the delegated voting power. In order to use this for voting, we need to address delegator voting. How should we handle it?

**Simple way:**
We could create a [validation strategy](https://docs.snapshot.org/strategies/what-is-a-strategy-1) that only allows voting from non-delegators.

**Hard way (no clear, clean solution):**
Let all accounts vote, and when an account has voted, cut any delegations from that account for that specific proposal. (Problems: pre-computation, identify what proposal we are computing voting power for etc.)
