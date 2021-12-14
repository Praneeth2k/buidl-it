const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Memeit platform", function () {
  it("Should disperse revenue", async function () {
    const initialSupply = ethers.utils.parseUnits('1000000', 'ether') // 1 million
    const Token = await ethers.getContractFactory("Token")
    const token = await Token.deploy(initialSupply)
    await token.deployed()

    const [deployer, owner, user1, user2, user3] = await ethers.getSigners()

    let balance = await token.balanceOf(deployer.address)

    expect(balance.toString()).to.equal(initialSupply)


    const Memeit = await ethers.getContractFactory("Memeit");
    const memeit = await Memeit.deploy();
    await memeit.deployed();

    const memeitAddress = memeit.address // This address is passed on to the NFT contract below. NFT contract gives this address 
                                           //the approval to transact a created token between users (or to itself also).
                                           //Basically, this address acts as an intermediary during token transfer.

    // Send some bro tokens to memeit platform

    let transferAmount = ethers.utils.parseUnits('100000', 'ether') // 100k
    await token.transfer(memeitAddress, transferAmount)
    expect(await token.balanceOf(memeitAddress)).to.equal(transferAmount)


    
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(memeitAddress);
    await nft.deployed();

    const nftContractAddress = nft.address

    let transaction = await nft.connect(owner).createToken("www.tokenURI1")

    let tx = await transaction.wait()

    let event = tx.events[0]
    let value = event.args[2]
    let tokenID1 = value.toNumber()
    //console.log(tokenID1)
    // const tokenID2 = await nft.createToken("www.tokenURI2")
    

    let auctionPrice = ethers.utils.parseUnits('10', 'ether')
    transaction = await memeit.connect(owner).createNFT(nftContractAddress, tokenID1, 20, auctionPrice)
    tx = await transaction.wait() 
    event = tx.events[0]
    value = event.args.memeId
    let memeId1 = value.toNumber()


    //--------------------------------------------------------------------------------//
    //SMALL BREAK

    // What if someone else creates market sale of an NFT item

    // "owner" is the one who minted tokenID1 and is the current owner
    // But user2 is trying to create a sale out of that NFT.
    //const transaction1 = 
    await expect(memeit.connect(user2).createNFT(nftContractAddress, tokenID1, 20, auctionPrice)).to.be.reverted
    //expect(await transaction1.wait()).to.be.reverted
    // let event1 = tx1.events[0]
    // let value1 = event1.args.memeId
    // let memeId2 = value1.toNumber()

    // await memeit.connect(user3).buyNFT(nftContractAddress, memeId2, { value: auctionPrice})

    //--------------------------------------------------------------------------------//


    //await market.createNFT(nftContractAddress, tokenID2, 15, auctionPrice)

    await memeit.connect(user1).buyNFT(nftContractAddress, memeId1, { value: auctionPrice})

    nftBalance = await nft.balanceOf(user1.address)

    
    let revenueGenerated = ethers.utils.parseUnits('100', 'ether')

    await memeit.disperseRevenue(token.address, revenueGenerated, memeId1)

    // Balance of the platform
    expect(await token.balanceOf(memeitAddress)).to.equal(ethers.utils.parseUnits('99900', 'ether'))

    //Balance of the original owner
    expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits('72', 'ether'))

    // Balance of user who had bought the NFT
    expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseUnits('18', 'ether'))

    //Now user1 who is the owner of the NFT decides to sell it
    
    // First he needs to approve memeit platform to transfer his nfts
    nft.connect(user1).setApprovalForAll(memeitAddress, true)

    auctionPrice = ethers.utils.parseUnits('15', 'ether')
    transaction = await memeit.connect(user1).sellNFT(nftContractAddress, memeId1, auctionPrice)

    // user2 buys it
    
    await memeit.connect(user2).buyNFT(nftContractAddress, memeId1, { value: auctionPrice})

    // Disperse revenue and see if user2 now got the revenue share

    await memeit.disperseRevenue(token.address, revenueGenerated, memeId1)

    // Balance of the platform
    expect(await token.balanceOf(memeitAddress)).to.equal(ethers.utils.parseUnits('99800', 'ether'))

    //Balance of the original owner 72 + 72
    expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits('144', 'ether'))

    // Balance of user who had bought the NFT (now user2)
    expect(await token.balanceOf(user2.address)).to.equal(ethers.utils.parseUnits('18', 'ether'))

    // Balance of user1 (shouldn't increase as he no longer holds the nft)
    expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseUnits('18', 'ether'))

    //-----------FETCH ALL-------------//
    let memeItems = await memeit.fetchAllMemes()

    memeItems = await Promise.all(memeItems.map(async meme => {
      const tokenUri = await nft.tokenURI(meme.tokenId)
      return (
        {
          memeId: meme.memeId.toString(),
          tokenId: meme.tokenId.toString(),
          originalSeller: meme.originalSeller,
          currentOwner: meme.currentOwner,
          price: meme.price.toString(),
          tokenUri,
          revenueShare: meme.percentageRevenueForCurrentOwner.toNumber()
        }
      )

    }))
    
    console.log(memeItems)

    //-------------FETCH MEMES CREATED-----------------//
    memeItems = await memeit.connect(owner).fetchMemesCreated()

    memeItems = await Promise.all(memeItems.map(async meme => {
      const tokenUri = await nft.tokenURI(meme.tokenId)
      return (
        {
          memeId: meme.memeId.toString(),
          tokenId: meme.tokenId.toString(),
          originalSeller: meme.originalSeller,
          currentOwner: meme.currentOwner,
          price: meme.price.toString(),
          tokenUri,
          revenueShare: meme.percentageRevenueForCurrentOwner.toNumber()
        }
      )

    }))
    
    console.log(memeItems)

    //---------------FETCH MY NFTs (NFTs I own)--------------//
    memeItems = await memeit.connect(user2).fetchMyNFTs()

    memeItems = await Promise.all(memeItems.map(async meme => {
      const tokenUri = await nft.tokenURI(meme.tokenId)
      return (
        {
          memeId: meme.memeId.toString(),
          tokenId: meme.tokenId.toString(),
          originalSeller: meme.originalSeller,
          currentOwner: meme.currentOwner,
          price: meme.price.toString(),
          tokenUri,
          revenueShare: meme.percentageRevenueForCurrentOwner.toNumber()
        }
      )

    }))
    
    console.log(memeItems)

    let amt = ethers.utils.parseUnits('100', 'ether')

    await memeit.faucet(token.address, user3.address)
    expect(await token.balanceOf(user3.address)).to.equal(amt)

    amt = 50
    balance = ethers.utils.parseUnits('150', 'ether')

    await memeit.withdrawTokens(token.address, user3.address, amt)
    expect(await token.balanceOf(user3.address)).to.equal(balance)
  });
});
