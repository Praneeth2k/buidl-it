const hre = require("hardhat")

async function main() {
    const Memeit = await hre.ethers.getContractFactory("Memeit");
    const memeit = await Memeit.deploy();
    try{

      await memeit.deployed();
    } catch(e){
      console.log(e)
    }
    console.log("Memeit deployed to:", memeit.address);

    const NFT = await hre.ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(memeit.address);
    await nft.deployed();
    console.log("NFT deployed to:", nft.address);

    const initialSupply = hre.ethers.utils.parseUnits('10000000000', 'ether')
    const Token = await hre.ethers.getContractFactory("Token");
    const token = await Token.deploy(initialSupply);
    await token.deployed();
    console.log("Token deployed to:", token.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });