# Pull Request — Punks / Base On-chain Collection Gallery

## Proposed title

`feat: load Punks Base collection metadata on-chain and link marketplace actions`

## Summary

This pull request changes the site from a static NFT showcase into a contract-driven collection gallery. The front end reads `totalSupply()` and `tokenURI(uint256)` from the Punks Base ERC-721 contract on Base Mainnet, resolves IPFS and Arweave metadata, and displays each token’s real collection image, name, description-ready data, and trait summary when available. Generated artwork is not used as a collection fallback; while the network is loading, the UI shows a neutral skeleton or a clear unavailable state.

The collection contract is `0xb9110ba3266f4983193c0d5f55c792a94368af28`. The site does not implement an unverified internal marketplace. Buy, sell and listing actions redirect users to the owner-provided OpenSea and Rarible collection pages, where the marketplace handles the wallet confirmation and transaction flow.

## Marketplace destinations

| Action | Destination |
|---|---|
| Collection discovery and buying | [OpenSea — Punks Base](https://opensea.io/collection/punks-base-1) |
| Collection items, selling and listing | [Rarible — Punks on Base](https://og.rarible.com/collection/base/0xb9110ba3266f4983193c0d5f55c792a94368af28/items) |
| Contract verification | [BaseScan contract](https://basescan.org/address/0xb9110ba3266f4983193c0d5f55c792a94368af28) |

## Included functionality

The interface is fully in English. It includes the Collection view, Creator Dashboard, Wallet Dashboard, Base network status, optional MetaMask connection, contract copying, collection supply display, metadata loading status, metadata error state, progressive loading of additional token batches, and responsive layouts.

Each NFT card now uses on-chain metadata when available and links to the corresponding OpenSea asset URL using the collection contract and token ID. The card also links to the owner-provided Rarible collection. The market section contains direct OpenSea and Rarible buttons instead of attempting to sign or simulate a custom marketplace transaction.

## Technical implementation

The browser calls Base Mainnet JSON-RPC at `https://mainnet.base.org`. It reads the ERC-721 function selectors for `totalSupply()` and `tokenURI(uint256)`, decodes the returned ABI string, normalizes `ipfs://` and `ar://` URIs, and fetches the JSON metadata from the resulting gateway URL. The first batch loads 24 tokens; the user can request subsequent batches so the full 10,000-token supply is not requested in one blocking operation. Each loaded token can open a detailed metadata sheet showing its real image, token ID, description and complete attributes, with a direct OpenSea token link.

The site keeps the existing static Vite architecture and remains compatible with free GitHub Pages hosting. `vite.config.ts` uses a relative base path so repository pages can resolve bundled assets under a project subpath. The GitHub Actions workflow now follows the official two-job Pages pattern: one job fixes Node 22, installs pnpm 10.4.1 explicitly with npm, restores the pnpm store cache, installs dependencies, builds the project and uploads `dist/public`; a dependent deploy job publishes that artifact with `pages: write` and `id-token: write` permissions. The duplicate pnpm declaration was removed from `devDependencies`; `packageManager` is now the only package manifest version reference.

## Verification

`pnpm check` passes. `pnpm build` passes, and `dist/public/index.html` is present for the Pages artifact. The workflow was corrected to separate build and deploy permissions, avoid the multiple-version pnpm failure, and automatically enable the repository Pages site with `configure-pages@v5` and `enablement: true`. The build job now also has `pages: write`, which fixes the `Get Pages site failed` / `Resource not accessible by integration` error when Pages has not yet been initialized. The toolchain was verified locally with Node 22.13.0, pnpm 10.4.1, `pnpm install --frozen-lockfile`, `pnpm check`, and `pnpm build`. The contract probe confirmed `totalSupply() = 10,000` and confirmed that `tokenURI(1)` returns an IPFS URI. The OpenSea URL was verified as the Punks collection on Base with item, trait, activity and marketplace filters. The Rarible URL was verified as the contract-addressed Base collection destination.

## Security and scope note

The site never requests a seed phrase or private key. It does not call approval, transfer, sale, listing or mint methods on the collection contract. Marketplace actions are handled on OpenSea or Rarible, which keeps signing and listing rules in the selected marketplace. The collection owner should still verify live marketplace listings, token metadata and royalties before public promotion. The supplied Rarible collection link is used as the official external destination for collection-level selling and listing actions.

## GitHub Pages setup

The workflow attempts to enable Pages automatically. If repository policy prevents that API operation, enable it once manually under **Settings → Pages → Build and deployment → GitHub Actions**, then rerun the workflow. MetaMask is the only wallet connection supported by this static site. No private wallet credential belongs in the repository.

## Follow-up

A future revision can add a richer metadata drawer with every attribute, owner lookup through `ownerOf(tokenId)`, live listing status from a marketplace API, and token-specific Rarible item URLs once the marketplace’s item URL format is confirmed for this collection.


## Custom marketplace preparation

This revision also prepares a non-custodial custom marketplace draft in `contracts/PunksBaseMarketplace.sol`. The draft supports fixed-price ERC-721 listings, exact native-token payments, seller cancellation, pause controls, reentrancy protection, two-step ownership, approval checks and a capped royalty configuration.

The configured royalty is 10% (`1000` basis points) for `0x92524f2a43a4337d6b475d78c3ba9e70f5d3a000`. The collection remains on Base Mainnet (`8453`); Base Sepolia (`84532`) is reserved for isolated testing. The marketplace addresses remain intentionally empty in the frontend, so no marketplace signature or transfer can be requested before deployment and audit.

This source is not audited and is not deployed. Before any Mainnet use, the project requires Base Sepolia tests, static analysis, independent security review, source verification and explicit owner confirmation of the final bytecode, fees, royalty policy and beneficiary address. The project does not claim quantum-safe cryptography: MetaMask/EVM signing remains based on the network’s existing cryptographic primitives.
