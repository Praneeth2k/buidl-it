//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; // For _setTokenURI
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // For minting and setting approval for all

import "@openzeppelin/contracts/utils/Counters.sol"; // Cuz we can't count by ourselves

import "hardhat/console.sol"; 

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address memeitAddress) ERC721("Memeit", "MMT") {
        contractAddress = memeitAddress;
    }

    // Mints NFT and returns the id of the NFT created
    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true); // Gives the marketplace the approval to transact tokens between users.
        return newItemId;
    } 

}
