import React, {useState, useEffect} from 'react'
import Meme from './Meme'

import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import axiosInstance from './axios'

import {nftaddress, memeitaddress} from './config'

import NFT from './artifacts/src/contracts/NFT.sol/NFT.json'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'


let rpcEndpoint = null

if (process.env.REACT_APP_WORKSPACE_URL) {
    rpcEndpoint = process.env.REACT_APP_WORKSPACE_URL
} 

function Memes() {
    const [memes, setMemes] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [time, setTime] = useState(Date.now());


    useEffect(() => {
        loadMemes() 
        const interval = setInterval(() => setTime(Date.now()), 10000);
        return () => {
            clearInterval(interval);
        };
    }, [time])

    async function loadMemes() {
        console.log(rpcEndpoint)
        
        const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
        const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const memeitContract = new ethers.Contract(memeitaddress, Memeit.abi, provider)
        const data = await memeitContract.fetchAllMemes()

        // Get all memes
        const database = await axiosInstance.get('/post')
        console.log(database)
        
        const dataItems = database.data.data.data

        const memeItems = await Promise.all(data.map(async i => {
            let _id
            let likes
            let views
            let totalRevenue
            let revenueShare

            const memeId = i.memeId.toNumber()
            dataItems.forEach((post) => {
                if(post.memeId === memeId) {
                    _id = post._id
                    likes = post.likes
                    views = post.views
                    totalRevenue = post.totalRevenue
                    revenueShare = post.revenueGenerated
                }
            })
            console.log("_id is ", _id)
            const tokenUri = await nftContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            console.log(meta.data.image)

            let meme = {
                _id,
                user: meta.data.user,
                price,
                memeId,
                originalSeller:  i.originalSeller,
                currentOwner: i.currentOwner,
                image: meta.data.image,
                title: meta.data.title,
                percentageRevenue: i.percentageRevenueForCurrentOwner.toNumber(),
                sold: i.sold,
                likes,
                views,
                totalRevenue,
                revenueShare
            }

            return meme
        }))
        console.log(memeItems)

        setMemes(memeItems)
        setLoadingState('loaded')
    }

    async function buyNFT(nft) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(memeitaddress, Memeit.abi, signer)

        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const transaction = await contract.buyNFT(nftaddress, nft.memeId, {value:price})
        await transaction.wait()

        const signerAddress = await signer.getAddress()
        console.log(nft._id)

        const update = JSON.stringify({
            currentOwner: signerAddress
        })

        await axiosInstance.patch(`/post/${nft._id}`, update, {headers: {'Content-Type': 'application/json'}})
        loadMemes()
    }

    if (loadingState === 'loaded' && !memes.length) return (<h1 className="px-20 py-10 text-3xl">No memes</h1>)


    return (
        <div class="grid grid-cols-12 gap-0 dark:bg-black">
            <div class= "ml-2  sticky col-span-3 " >
                <img class="mt-20 max-w-xs" src="./ad1.png" alt="ad1"/>
                <img class="mt-56 max-w-xs" src="./ad2.jpeg" alt="ad2"/>
            </div>
            <div class="m-auto col-span-6">
                <div class=" border-gray-200 border-2 border-t-0 max-w-2xl">
                    {
                        memes.map((meme, i) => (<Meme meme={meme} buyNFT={buyNFT} option="1" key={i}/>))
                    }

                </div>
            </div>
            <div class="col-span-3 ">
                <img class="mt-20 max-w-xs m-auto" src="./ad3.png" alt="ad3"/>
            </div>
        </div>
    )
}

export default Memes
