const hre = require("hardhat")
const ethers = hre.ethers

import {tokenaddress, memeitaddress} from './src/config'

import Memeit from './src/artifacts/src/contracts/Memeit.sol/Memeit.json'
import Token from './src/artifacts/src/contracts/Token.sol/Token.json'
impor
async function main() {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)

    const memeitContract = new ethers.Contract(memeitaddress, Memeit.abi, provider)
    const tokenContract = new ethers.Contract(tokenaddress, Token.abi, provider)
    await memeitContract.disperseRevenue(token.address, revenueGenerated, memeId1)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });