# Blockchain architecture notes

## Verified source

- Base is EVM-equivalent to Ethereum; Solidity/Vyper, bytecode, ABIs and tooling are compatible.
- Official Base RPC endpoints documented: `https://mainnet.base.org` and `https://sepolia.base.org`.
- Base documentation recommends testing on Base Sepolia first, using a secure deployer keystore, never committing a private key, optionally dry-running deployments, then verifying the deployed contract and reading its state.
- Source: https://docs.base.org/base-chain/network-information/smart-contracts

## Project constraints

- Existing collection contract: `0xb9110ba3266f4983193c0d5f55c792a94368af28` on Base mainnet.
- Existing site is a static frontend and already reads ERC-721 `totalSupply()` and `tokenURI()` client-side.
- A new marketplace contract would be an irreversible financial component. It must not be deployed from this task without a written specification, testnet validation, independent security review/audit, and explicit owner confirmation.
- The safe immediate scope is: keep on-chain collection display, connect MetaMask, add read-only approval/listing previews, and integrate a verified marketplace adapter or external marketplace links. Real buy/sell/list transactions require an exact marketplace contract address, ABI, fee/royalty policy, supported payment token, admin controls, and testnet deployment plan.

## OpenZeppelin guidance

OpenZeppelin documents ERC-721 as the standard for unique non-fungible tokens and provides composable implementations such as `ERC721URIStorage`. The documentation notes that minting permissions should be restricted with access control when unrestricted minting is not intended. Any marketplace extension should therefore use audited, maintained OpenZeppelin primitives, explicit access control, careful payment accounting, and tests for reentrancy, authorization, token ownership and withdrawal paths.

- Source: https://docs.openzeppelin.com/contracts/5.x/erc721

## OpenSea marketplace architecture

OpenSea documents Seaport as the protocol powering its NFT transactions; OpenSea orders use Seaport for offers and fulfillment. This supports a safer product decision: the site can link to and, if later implemented, integrate a verified Seaport adapter rather than deploying an unreviewed custom marketplace contract. A custom contract should only be considered when the owner has a clear fee, royalty, custody, cancellation, upgradeability and admin-control specification and has completed testnet and independent audit work.

- Source: https://docs.opensea.io/docs/seaport
