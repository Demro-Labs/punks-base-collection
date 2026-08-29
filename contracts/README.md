# Punks Base Marketplace

This directory contains a **non-deployed, non-custodial marketplace draft** for the Punks collection on Base.

The collection contract is `0xb9110ba3266f4983193c0d5f55c792a94368af28` on Base Mainnet (chain ID `8453`). The prepared royalty configuration is `10%` (`1000` basis points) paid to `0x92524f2a43a4337d6b475d78c3ba9e70f5d3a000`.

## Design

The marketplace never holds NFTs between listings. A seller keeps custody and must approve the marketplace for the specific token or for the collection before a listing can be created. A buyer pays the exact native-token price; the contract transfers the NFT atomically, sends the royalty to the configured recipient, and sends the remainder to the seller. Listings can be cancelled by their seller, and the owner can pause listings and purchases during an incident.

The contract uses OpenZeppelin `Ownable2Step`, `Pausable`, and `ReentrancyGuard`. The royalty is capped at 25% in the contract. There is no upgrade proxy, no arbitrary external call, no withdrawal sweep, and no custody balance intended to remain in the contract.

## Safety status

This source is **not deployed** and must not be treated as audited. Before any Base Mainnet deployment, run tests and static analysis on Base Sepolia, obtain an independent smart-contract security review, verify the compiled source, confirm the royalty policy, and review the final bytecode and constructor parameters. The frontend intentionally keeps the marketplace address empty until those steps are complete, so it cannot accidentally request a marketplace transaction.

## Testnet workflow

Install Base’s Foundry toolchain, copy the environment example, and keep the deployer key in Foundry’s encrypted keystore. Build and test locally before any broadcast:

```bash
base-foundryup
base-forge install OpenZeppelin/openzeppelin-contracts --no-commit
base-forge build
base-forge test -vvv
```

Use `https://sepolia.base.org` for Base Sepolia. A deployment should be a dry run first; only a separately confirmed broadcast may publish a contract. Never commit a private key or seed phrase.

## Frontend integration

The static site reads the collection directly from Base Mainnet and connects to MetaMask. `client/src/lib/marketplace.ts` contains the chain IDs, ABI subset, royalty configuration and intentionally empty deployment addresses. Set an address only after audit and testnet validation; do not place private keys in the frontend.
