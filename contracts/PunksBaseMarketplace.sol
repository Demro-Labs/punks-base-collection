// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/// @title Punks Base Marketplace
/// @notice Non-custodial ERC-721 fixed-price marketplace for Base.
/// @dev Sellers keep custody of their NFT. They must approve this contract before a sale.
///      This source is prepared for audit and testnet validation; it is not deployed.
contract PunksBaseMarketplace is Ownable2Step, Pausable, ReentrancyGuard {
    using Address for address payable;

    uint256 public constant MAX_BPS = 10_000;
    uint256 public constant MAX_ROYALTY_BPS = 2_500;

    struct Listing {
        address seller;
        address nft;
        uint256 tokenId;
        uint256 price;
        uint64 expiry;
    }

    uint256 public nextListingId = 1;
    uint256 public royaltyBps;
    address payable public royaltyRecipient;
    mapping(uint256 listingId => Listing listing) public listings;

    error InvalidAddress();
    error InvalidPrice();
    error InvalidExpiry();
    error InvalidRoyalty();
    error ListingNotFound();
    error NotSeller();
    error NotOwner();
    error ListingExpired();
    error ExactPaymentRequired();
    error SellerNotApproved();
    error UnexpectedValue();

    event ListingCreated(uint256 indexed listingId, address indexed seller, address indexed nft, uint256 tokenId, uint256 price, uint64 expiry);
    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    event ItemPurchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price, uint256 royalty);
    event RoyaltyConfigUpdated(address indexed recipient, uint256 bps);

    constructor(address payable initialRoyaltyRecipient, uint256 initialRoyaltyBps)
        Ownable(msg.sender)
    {
        _setRoyaltyConfig(initialRoyaltyRecipient, initialRoyaltyBps);
    }

    /// @notice Create an off-chain-custody listing. The NFT remains in the seller wallet.
    function createListing(address nft, uint256 tokenId, uint256 price, uint64 expiry)
        external
        whenNotPaused
        returns (uint256 listingId)
    {
        if (nft == address(0)) revert InvalidAddress();
        if (price == 0) revert InvalidPrice();
        if (expiry <= block.timestamp) revert InvalidExpiry();

        IERC721 token = IERC721(nft);
        if (token.ownerOf(tokenId) != msg.sender) revert NotOwner();
        if (!_isApproved(token, msg.sender, tokenId)) revert SellerNotApproved();

        listingId = nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            nft: nft,
            tokenId: tokenId,
            price: price,
            expiry: expiry
        });

        emit ListingCreated(listingId, msg.sender, nft, tokenId, price, expiry);
    }

    /// @notice Buy a listed NFT with the exact native-token price.
    function buy(uint256 listingId) external payable whenNotPaused nonReentrant {
        Listing memory listing = listings[listingId];
        if (listing.seller == address(0)) revert ListingNotFound();
        if (block.timestamp > listing.expiry) revert ListingExpired();
        if (msg.value != listing.price) revert ExactPaymentRequired();

        IERC721 token = IERC721(listing.nft);
        if (token.ownerOf(listing.tokenId) != listing.seller) revert NotOwner();
        if (!_isApproved(token, listing.seller, listing.tokenId)) revert SellerNotApproved();

        delete listings[listingId];

        uint256 royalty = (listing.price * royaltyBps) / MAX_BPS;
        uint256 sellerAmount = listing.price - royalty;

        token.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        if (royalty != 0) royaltyRecipient.sendValue(royalty);
        payable(listing.seller).sendValue(sellerAmount);

        emit ItemPurchased(listingId, msg.sender, listing.seller, listing.price, royalty);
    }

    /// @notice Cancel a listing. Only the original seller can cancel it.
    function cancelListing(uint256 listingId) external {
        Listing memory listing = listings[listingId];
        if (listing.seller == address(0)) revert ListingNotFound();
        if (listing.seller != msg.sender) revert NotSeller();

        delete listings[listingId];
        emit ListingCancelled(listingId, msg.sender);
    }

    /// @notice Pause new listings and purchases during an incident.
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Update royalty configuration. Capped at 25% for safety.
    function setRoyaltyConfig(address payable recipient, uint256 bps) external onlyOwner {
        _setRoyaltyConfig(recipient, bps);
    }

    function _setRoyaltyConfig(address payable recipient, uint256 bps) internal {
        if (recipient == address(0)) revert InvalidAddress();
        if (bps > MAX_ROYALTY_BPS) revert InvalidRoyalty();
        royaltyRecipient = recipient;
        royaltyBps = bps;
        emit RoyaltyConfigUpdated(recipient, bps);
    }

    function _isApproved(IERC721 token, address seller, uint256 tokenId) internal view returns (bool) {
        return token.getApproved(tokenId) == address(this) || token.isApprovedForAll(seller, address(this));
    }

    /// @dev Reject accidental native-token transfers that have no listing context.
    receive() external payable {
        revert UnexpectedValue();
    }

    fallback() external payable {
        revert UnexpectedValue();
    }
}
