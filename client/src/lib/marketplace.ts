// Base Terminal / marketplace configuration: explicit network separation, no transaction is sent without a deployed audited address.

export const COLLECTION_ADDRESS = "0xb9110ba3266f4983193c0d5f55c792a94368af28" as const;
export const BASE_MAINNET_CHAIN_ID = 8453 as const;
export const BASE_SEPOLIA_CHAIN_ID = 84532 as const;
export const ROYALTY_BPS = 1_000 as const;
export const ROYALTY_PERCENT = 10 as const;
export const ROYALTY_RECIPIENT = "0x92524f2a43a4337d6b475d78c3ba9e70f5d3a000" as const;

// Empty until the custom marketplace is audited and deployed. This prevents accidental signing.
export const MARKETPLACE_MAINNET_ADDRESS = "" as const;
export const MARKETPLACE_SEPOLIA_ADDRESS = "" as const;

export const MARKETPLACE_ABI = [
  "function createListing(address nft,uint256 tokenId,uint256 price,uint64 expiry) returns (uint256 listingId)",
  "function buy(uint256 listingId) payable",
  "function cancelListing(uint256 listingId)",
  "function listings(uint256 listingId) view returns (address seller,address nft,uint256 tokenId,uint256 price,uint64 expiry)",
  "function royaltyBps() view returns (uint256)",
  "function royaltyRecipient() view returns (address)",
] as const;

export function marketplaceAddressForChain(chainId: number): string {
  if (chainId === BASE_MAINNET_CHAIN_ID) return MARKETPLACE_MAINNET_ADDRESS;
  if (chainId === BASE_SEPOLIA_CHAIN_ID) return MARKETPLACE_SEPOLIA_ADDRESS;
  return "";
}
