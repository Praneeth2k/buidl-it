require("@nomiclabs/hardhat-waffle");
const fs = require('fs')
let privateKey
if(process.env.NODE_ENV === 'development'){
  privateKey = fs.readFileSync(".secret").toString()
} else {
  privateKey = ""
}


const projectId = "62d1a151f08d48ee903d0a74d0a8f2fa"


module.exports = {
  networks: {
    hardhat: {
      chainId: 1337 // Mentioned in Hardhat docs
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      accounts: [privateKey]
    } 
  },
  solidity: "0.8.4",
  paths: {
    sources: "./src/contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./src/artifacts"
  },

};
