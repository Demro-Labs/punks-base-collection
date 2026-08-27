# Pull Request — Punks / Base On-chain Collection Gallery

## Proposed title

`feat: load Punks Base collection metadata on-chain and link marketplace actions`

## Summary

This pull request changes the site from a static NFT showcase into a contract-driven collection gallery. The front end reads `totalSupply()` and `tokenURI(uint256)` from the Punks Base ERC-721 contract on Base Mainnet, resolves IPFS and Arweave metadata, and displays each token’s image, name, description-ready data, and trait summary when available.

The collection contract is `0xb9110ba3266f4983193c0d5f55c792a94368af28`. The site does not implement an unverified internal marketplace. Buy, sell and listing actions redirect users to the owner-provided OpenSea and Rarible collection pages, where the marketplace handles the wallet confirmation and transaction flow.

## Marketplace destinations

| Action | Destination |
|---|---|
| Collection discovery and buying | [OpenSea — Punks Base](https://opensea.io/collection/punks-base-1) |
| Collection items, selling and listing | [Rarible — Punks on Base](https://og.rarible.com/collection/base/0xb9110ba3266f4983193c0d5f55c792a94368af28/items) |
| Contract verification | [BaseScan contract](https://basescan.org/address/0xb9110ba3266f4983193c0d5f55c792a94368af28) |

## Included functionality

The interface is fully in English. It includes the Collection view, Creator Dashboard, Wallet Dashboard, Base network status, MetaMask connection, WalletConnect QR connection when `VITE_WALLETCONNECT_PROJECT_ID` is supplied, contract copying, collection supply display, metadata loading status, metadata error state, progressive loading of additional token batches, and responsive layouts.

Each NFT card now uses on-chain metadata when available and links to the corresponding OpenSea asset URL using the collection contract and token ID. The card also links to the owner-provided Rarible collection. The market section contains direct OpenSea and Rarible buttons instead of attempting to sign or simulate a custom marketplace transaction.

## Technical implementation

The browser calls Base Mainnet JSON-RPC at `https://mainnet.base.org`. It reads the ERC-721 function selectors for `totalSupply()` and `tokenURI(uint256)`, decodes the returned ABI string, normalizes `ipfs://` and `ar://` URIs, and fetches the JSON metadata from the resulting gateway URL. The first batch loads 24 tokens; the user can request subsequent batches so the full 10,000-token supply is not requested in one blocking operation. Each loaded token can open a detailed metadata sheet showing its image, token ID, description and complete attributes, with a direct OpenSea token link.

The site keeps the existing static Vite architecture and remains compatible with free GitHub Pages hosting. `vite.config.ts` uses a relative base path so repository pages can resolve bundled assets under a project subpath. The GitHub Actions workflow publishes `dist/public` through the official Pages artifact/deploy actions.

## Verification

`pnpm check` passes. `pnpm build` passes. The contract probe confirmed `totalSupply() = 10,000` and confirmed that `tokenURI(1)` returns an IPFS URI. The OpenSea URL was verified as the Punks collection on Base with item, trait, activity and marketplace filters. The Rarible URL was verified as the contract-addressed Base collection destination.

## Security and scope note

The site never requests a seed phrase or private key. It does not call approval, transfer, sale, listing or mint methods on the collection contract. Marketplace actions are handled on OpenSea or Rarible, which keeps signing and listing rules in the selected marketplace. The collection owner should still verify live marketplace listings, token metadata and royalties before public promotion. The supplied Rarible collection link is used as the official external destination for collection-level selling and listing actions.

## GitHub Pages setup

Enable **Settings → Pages → Build and deployment → GitHub Actions**. Add `VITE_WALLETCONNECT_PROJECT_ID` as a repository variable under **Settings → Secrets and variables → Actions → Variables** if WalletConnect QR support is required. Create the Project ID in [Reown Cloud](https://cloud.reown.com/). No private wallet credential belongs in the repository.

## Follow-up

A future revision can add a richer metadata drawer with every attribute, owner lookup through `ownerOf(tokenId)`, live listing status from a marketplace API, and token-specific Rarible item URLs once the marketplace’s item URL format is confirmed for this collection.
