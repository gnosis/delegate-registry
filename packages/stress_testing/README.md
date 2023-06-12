# Delegate Registry Stress Testing

This packages contains utility functionality and instructions for how to stress test the Delegate Registry.

Process to stress test:

1. Buy a ENS name https://app.ens.domains/ on Goerli. For instance, `mydao.eth`.
2. Go to https://demo.snapshot.org/#/. Click the + and go through the wizard for setting up a new Snapshot Space.
3. On the Strategy step (How would you like to setup voting?), select token weighted voting. Use this settings:
   - Network: Ethereum Testnet Goerli
   - Token standard: ERC-20
   - Token contract: 0xE666Ad68a6e2897CD06A9ff378ED8b0d71093398
4. Generate new delegations (in bulk) here: https://goerli.etherscan.io/address/0x5238b5fda42819aaf4d64404d26a4043f861ae8e#writeContract
5. Replace the source address here `packages/subgraph/subgraph.yaml`, with the Delegates `0x5238b5fda42819aaf4d64404d26a4043f861ae8e`
6. Deploy a new Subgraph (for testing), the subgraph names should end in the chain name (for instence, gnosis or goerli).
7. Repeat steps 4 to 6 for adictional networks (this is cross-chain, so we should have delegations on multiple networks).
8. Update the graphQL enpoint in `packages/backend/.graphclientrc.yml`.
