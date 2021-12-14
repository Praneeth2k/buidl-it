//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // Security purposes. Prevent multiple requests from same client
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";



import "@openzeppelin/contracts/utils/Counters.sol"; // Cuz we can't count by ourselves

import "hardhat/console.sol";

import "./Token.sol";
import "./NFT.sol";

contract Memeit is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _memeIds;
  Counters.Counter private _memesSold;

  using SafeMath for uint;

  address payable owner; // The owner of Memeit platform
  uint platformShare = 10; // 10% revenue goes to the platform (owner)

  constructor() {
    owner = payable(msg.sender);     
  }

  struct MemeNFT {
      uint memeId;
      address nftContract;
      uint tokenId;
      address payable originalSeller; // The one who made the meme and turned it into an NFT
      address payable currentOwner; // NFT may change hands multiple times. We keep track of the current owner who gets a share of revenue
      uint percentageRevenueForCurrentOwner; // If 10 the NFT holder gets 10% of revenue that the meme generates
      uint price; 
      bool sold;
  }

  mapping (uint => MemeNFT) private idToMemeNFT;

  event MemeNFTCreated (
      uint indexed memeId,
      address indexed nftContract,
      uint indexed tokenId,
      address originalSeller, 
      address currentOwner,
      uint percentageRevenueForCurrentOwner,
      uint price,
      bool sold
  );
  // create nft item
  function createNFT(address _nftContractAddress, uint _tokenId, uint _percentageRevenueForCurrentOwner, uint _price) public payable nonReentrant returns (uint){
      require(IERC721(_nftContractAddress).ownerOf(_tokenId) == msg.sender, "Wrong owner");
      _memeIds.increment();     
      uint256 _memeId = _memeIds.current();
      idToMemeNFT[_memeId] = MemeNFT(
          _memeId,
          _nftContractAddress,
          _tokenId,
          payable(msg.sender), // Original owner and current owner are the same initially
          payable(msg.sender),
          _percentageRevenueForCurrentOwner,
          _price,
          false
      );

      emit MemeNFTCreated(
          _memeId,
          _nftContractAddress,
          _tokenId,
          msg.sender,
          msg.sender,
          _percentageRevenueForCurrentOwner,
          _price,
          false
      );
      return _memeId;
  }

  // put it out for sale (used while nft changes hands from the second time)
  function sellNFT(address _nftContractAddress, uint _memeId, uint _price) public payable nonReentrant returns (uint) {
    uint _tokenId = idToMemeNFT[_memeId].tokenId;
    require(IERC721(_nftContractAddress).ownerOf(_tokenId) == msg.sender, "Wrong owner");
    require(idToMemeNFT[_memeId].sold == true, "NFT is already on sale");

    idToMemeNFT[_memeId].sold = false;
    idToMemeNFT[_memeId].price = _price;

    emit MemeNFTCreated(
        _memeId,
        _nftContractAddress,
        _tokenId,
        idToMemeNFT[_memeId].originalSeller,
        msg.sender,
        idToMemeNFT[_memeId].percentageRevenueForCurrentOwner,
        _price,
        false
    );

    return _memeId;

  }

  // buy nft
  function buyNFT (address _nftContractAddress, uint memeId) public payable nonReentrant{
      uint price = idToMemeNFT[memeId].price;
      uint tokenId = idToMemeNFT[memeId].tokenId;
      require(idToMemeNFT[memeId].sold == false, "Item already sold");
      require(msg.value == price, "Please submit the asking price in order to complete the purchase");

      idToMemeNFT[memeId].originalSeller.transfer(msg.value);

      IERC721(_nftContractAddress).transferFrom(idToMemeNFT[memeId].currentOwner, msg.sender, tokenId);
      idToMemeNFT[memeId].sold = true;
      idToMemeNFT[memeId].currentOwner = payable(msg.sender);
      _memesSold.increment();
  }

  function disperseRevenue(address _token, uint256 _amount, uint memeId) public payable nonReentrant{ 
    //uint _hundred = 100;
    // CALCULATING AMOUNT DISTRIBUTION

    // The platform (memeit) takes its cut (10%)
    uint256 _platformShare = _amount.mul(10).div(100);

    uint256 _remainingAmount = _amount.sub(_platformShare);

    // Current holder of the NFT share
    uint256 _currentOwnerShare = _remainingAmount.mul(idToMemeNFT[memeId].percentageRevenueForCurrentOwner).div(100);

    // Original seller share (creator of the meme)
    //uint _originalSellerShare = _remainingAmount.mul(_hundred.sub(idToMemeNFT[memeId].percentageRevenueForCurrentOwner)).div(100);
    //OR
    uint256 _originalSellerShare = _remainingAmount.sub(_currentOwnerShare);

    // TRANSFERRING THE TOKENS

    require(Token(_token).transfer(owner, _platformShare));
    require(Token(_token).transfer(idToMemeNFT[memeId].currentOwner, _currentOwnerShare));
    require(Token(_token).transfer(idToMemeNFT[memeId].originalSeller, _originalSellerShare));
  }

  function fetchAllMemes() public view returns (MemeNFT[] memory) {
    uint memesCount =  _memeIds.current();
    MemeNFT[] memory memes = new MemeNFT[](memesCount);
    uint currentIndex = 0;
    for (uint i = 0; i < memesCount; i++) {
      MemeNFT storage currentMeme = idToMemeNFT[i+1];
      memes[currentIndex] = currentMeme;
      currentIndex += 1;
    }
    return memes;
  }

  function fetchMemesCreated() public view returns (MemeNFT[] memory) {
    uint memesCount = _memeIds.current();
    uint totalCount = 0;

    for(uint i = 0; i < memesCount; i++) {
      if(idToMemeNFT[i+1].originalSeller == msg.sender) {
        totalCount += 1;
      }
    }

    MemeNFT [] memory memes = new MemeNFT[](totalCount);
    uint currentIndex = 0;
    for(uint i = 0; i < memesCount; i++){
      if(idToMemeNFT[i+1].originalSeller == msg.sender){
        MemeNFT storage currentMeme = idToMemeNFT[i+1];
        memes[currentIndex] = currentMeme;
        currentIndex +=1;
      }
    }
    return memes;
  }

  function fetchMyNFTs() public view returns (MemeNFT[] memory) {
    uint memesCount = _memeIds.current();
    uint totalCount = 0;

    for(uint i = 0; i < memesCount; i++) {
      if(idToMemeNFT[i+1].currentOwner == msg.sender) {
        totalCount += 1;
      }
    }

    MemeNFT [] memory memes = new MemeNFT[](totalCount);
    uint currentIndex = 0;
    for(uint i = 0; i < memesCount; i++){
      if(idToMemeNFT[i+1].currentOwner == msg.sender){
        MemeNFT storage currentMeme = idToMemeNFT[i+1];
        memes[currentIndex] = currentMeme;
        currentIndex +=1;
      }
    }
    return memes;
  }

  function faucet(address _token, address _reciever) public payable nonReentrant{
    uint amount = 100 * (10**18);
    Token(_token).transfer(_reciever, amount);
  }

  function withdrawTokens(address _token, address _reciever, uint _amount) public payable nonReentrant{
    uint amount = _amount * (10**18);
    Token(_token).transfer(_reciever, amount);
  }
}

