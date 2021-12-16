require("@nomiclabs/hardhat-waffle");
const fs = require('fs')
let privateKey
if(process.env.NODE_ENV === 'development'){
  privateKey = fs.readFileSync(".secret").toString()
} else {
  privateKey = "623da39377b7c90d5928afb60945d1c98d835f5eb5467697e80aeb2ba5c28de5"
}


const projectId = "0c928750a74b4464bbe01fe61286f7a7"


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
