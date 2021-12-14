const hre = require("hardhat");

async function main() {
    async function createMemeNFT() {
        const { title, price } = formInput
        if(!title || !price || !fileUrl) return

        const data = JSON.stringify({
            title, price, image: fileUrl
        })

        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`

            createSale(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createSale(url) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let contract= new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        let price = ethers.utils.parsteUnits(formInput.price, 'ether')

        contract = new etehers.Contract(memeitaddress, Memeit.abi, signer)
        transaction = await contract.createMemeNFT(nftaddress, tokenId, formInput.revenueShare, price)
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });