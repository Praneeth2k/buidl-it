import React, {useState, useEffect} from 'react'
import Meme from './Meme'

import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {nftaddress, memeitaddress} from './config'

import NFT from './artifacts/src/contracts/NFT.sol/NFT.json'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'



function MyCollection() {
    const [memes, setMemes] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadMemes()
    }, [])

    async function loadMemes() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        console.log(await signer.getAddress())

        const memeitContract = new ethers.Contract(memeitaddress, Memeit.abi, signer)
        const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await memeitContract.fetchMyNFTs()

        const memeItems = await Promise.all(data.map(async i => {
            const tokenUri = await nftContract.tokenURI(i.tokenId)
            console.log(tokenUri)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            

            let meme = {
                user: meta.data.user,
                price,
                memeId: i.memeId.toNumber(),
                originalSeller:  i.originalSeller,
                currentOwner: i.currentOwner,
                image: meta.data.image,
                title: meta.data.title,
                percentageRevenue: i.percentageRevenueForCurrentOwner.toNumber()
            }

            return meme
        }))
        console.log(memeItems)

        setMemes(memeItems)
        setLoadingState('loaded')
    }

    async function sellNFT(nft, newPrice) {
        console.log(newPrice)
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(memeitaddress, Memeit.abi, signer)

        const price = ethers.utils.parseUnits(newPrice.toString(), 'ether')
        const transaction = await contract.sellNFT(nftaddress, nft.memeId, price)
        await transaction.wait()
        loadMemes()
    }


    if (loadingState === 'loaded' && !memes.length) return (<h1 className="px-20 py-10 text-3xl">No memes</h1>)


    return (
        <div class="m-auto mt-2 max-w-lg bg-green-500">
            <h1 className="m-3">Memes you own</h1>
            {
                memes.map((meme, i) => (<Meme meme={meme} sellNFT={sellNFT} option="3" key={i}/>))
            }
        </div>
    )
}

export default MyCollection
