// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {PunksBaseMarketplace} from "../PunksBaseMarketplace.sol";

contract MockPunk is ERC721 {
    constructor() ERC721("Mock Punk", "MPUNK") {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}

contract PunksBaseMarketplaceTest is Test {
    PunksBaseMarketplace internal market;
    MockPunk internal nft;
    address internal seller = address(0xA11CE);
    address internal buyer = address(0xB0B);
    address payable internal royaltyRecipient = payable(address(0xC0FFEE));

    function setUp() public {
        market = new PunksBaseMarketplace(royaltyRecipient, 1_000);
        nft = new MockPunk();
        nft.mint(seller, 1);
        vm.deal(buyer, 10 ether);
    }

    function testCreateListingRequiresApproval() public {
        vm.prank(seller);
        vm.expectRevert(PunksBaseMarketplace.SellerNotApproved.selector);
        market.createListing(address(nft), 1, 1 ether, uint64(block.timestamp + 1 days));
    }

    function testBuyMovesNftAndSplitsRoyalty() public {
        vm.prank(seller);
        nft.approve(address(market), 1);
        vm.prank(seller);
        uint256 listingId = market.createListing(address(nft), 1, 1 ether, uint64(block.timestamp + 1 days));

        uint256 sellerBefore = seller.balance;
        uint256 royaltyBefore = royaltyRecipient.balance;
        vm.prank(buyer);
        market.buy{value: 1 ether}(listingId);

        assertEq(nft.ownerOf(1), buyer);
        assertEq(royaltyRecipient.balance - royaltyBefore, 0.1 ether);
        assertEq(seller.balance - sellerBefore, 0.9 ether);
    }

    function testBuyRejectsIncorrectPayment() public {
        vm.prank(seller);
        nft.approve(address(market), 1);
        vm.prank(seller);
        uint256 listingId = market.createListing(address(nft), 1, 1 ether, uint64(block.timestamp + 1 days));

        vm.prank(buyer);
        vm.expectRevert(PunksBaseMarketplace.ExactPaymentRequired.selector);
        market.buy{value: 0.99 ether}(listingId);
    }

    function testOnlySellerCanCancel() public {
        vm.prank(seller);
        nft.approve(address(market), 1);
        vm.prank(seller);
        uint256 listingId = market.createListing(address(nft), 1, 1 ether, uint64(block.timestamp + 1 days));

        vm.prank(buyer);
        vm.expectRevert(PunksBaseMarketplace.NotSeller.selector);
        market.cancelListing(listingId);
    }

    function testPauseBlocksNewListing() public {
        market.pause();
        vm.prank(seller);
        nft.approve(address(market), 1);
        vm.prank(seller);
        vm.expectRevert();
        market.createListing(address(nft), 1, 1 ether, uint64(block.timestamp + 1 days));
    }
}
