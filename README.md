# Punks Base Collection

A static React collection terminal for the Punks Base NFT collection on Base Mainnet.

The website reads the collection directly from the ERC-721 contract, resolves token metadata and real images from `tokenURI()`, and provides direct links to the official OpenSea and Rarible collection pages for buying, selling and listing.

## Collection

| Property | Value |
|---|---|
| Network | Base Mainnet |
| Contract | [`0xb9110ba3266f4983193c0d5f55c792a94368af28`](https://basescan.org/address/0xb9110ba3266f4983193c0d5f55c792a94368af28) |
| Supply | 10,000 NFTs |
| OpenSea | [Punks Base 1](https://opensea.io/collection/punks-base-1) |
| Rarible | [Punks Base Collection](https://og.rarible.com/collection/base/0xb9110ba3266f4983193c0d5f55c792a94368af28/items) |

## Features

- On-chain collection discovery through Base Mainnet JSON-RPC.
- ERC-721 `totalSupply()` and `tokenURI(uint256)` support.
- Progressive loading for the 10,000-token collection.
- Real token images and metadata from IPFS or Arweave URIs.
- Token detail view with name, description, token ID and attributes.
- Direct collection and token links to OpenSea and Rarible.
- Base network wallet connection interface.
- English-language collection, wallet and creator dashboard views.
- Static deployment compatible with GitHub Pages.
- No private keys, seed phrases or signing credentials are requested by the website.

## Technology

- React 19
- Vite
- TypeScript
- Tailwind CSS 4
- Wouter
- Lucide React
- Base Mainnet JSON-RPC
- GitHub Actions and GitHub Pages

## Local development

Requirements: Node.js 22 or newer and pnpm 10.4.1.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The development server is available at `http://localhost:3000`.

## Validation and production build

```bash
pnpm check
pnpm build
```

The static site is generated in `dist/public`. The build also produces the compatibility server bundle required by the project template.

## WalletConnect configuration

WalletConnect is optional for the collection browsing experience. To enable the QR-code connection flow, create a project at [Reown Cloud](https://cloud.reown.com/) and add the following repository variable in GitHub:

```text
VITE_WALLETCONNECT_PROJECT_ID=your_reown_project_id
```

In GitHub, open **Settings → Secrets and variables → Actions → Variables** and create the variable with the exact name above. A Project ID is public configuration; never commit a private key, recovery phrase or wallet secret.

## GitHub Pages deployment

The repository includes `.github/workflows/deploy-pages.yml`. The workflow:

1. Uses Node.js 22.
2. Installs pnpm 10.4.1.
3. Installs dependencies from the lockfile.
4. Builds the static site.
5. Uploads `dist/public` as the Pages artifact.
6. Deploys the artifact to GitHub Pages.

To publish the site:

1. Set the repository visibility and Pages eligibility in GitHub.
2. Open **Settings → Pages** and choose **GitHub Actions** as the source.
3. Open the **Actions** tab and run **Deploy Punks Base to GitHub Pages** on the `main` branch.
4. Open the Pages URL shown in the successful deployment environment.

For a free GitHub Pages setup, a public repository is the simplest option. If the repository remains private, GitHub Pages availability depends on the account plan and organization policy.

## Marketplace scope

The collection contract is used for reading supply, token URIs and metadata. The website does not implement marketplace approval, transfer, sale or listing contract calls. Buying, selling and listing actions open OpenSea or Rarible so that the user can review the live marketplace page and approve any transaction in the selected marketplace wallet flow.

Always verify the collection address, token metadata, marketplace listing and network before signing a transaction.

## Project structure

```text
client/
  src/
    components/    Reusable UI components
    pages/          Collection page and dashboards
    App.tsx         Application routes
    index.css       Design system and responsive styles
.github/
  workflows/
    deploy-pages.yml
PULL_REQUEST.md    Pull request description and release notes
```

## License

This repository is provided for the Punks Base Collection website. Add the project’s preferred license before publishing source code for reuse.
