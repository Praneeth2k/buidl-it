import React, {useState, useEffect} from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from 'web3modal'

import { useNavigate } from 'react-router-dom'


import {
    nftaddress, memeitaddress, tokenaddress
} from './config'

import NFT from './artifacts/src/contracts/NFT.sol/NFT.json'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'
import axios from './axios'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

function CreateMeme() {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', title: '', revenueShare: 0})
    const [error, setError] = useState(null)
    const [msg, setMsg] = useState(null)
    const [processing1, setProcessing1] = useState(null)
    const [processing2, setProcessing2] = useState(null)


    let navigate = useNavigate();

    async function onChange(e) {
        const file = e.target.files[0]

        try {
            const added = await client.add(
                file,
                 {
                     progress: (prog) => console.log(`recieved: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createMemeNFT() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const { title, price, revenueShare } = formInput
        

        if(!title || !price || !revenueShare) {
            setError("Enter all fields")
            return
        }
        if(!fileUrl) {
            setError("Upload image")
            return
        }
        if(isNaN(price)){
            setError("Price incorrect, enter a number")
            return
        }
        if(price<0){
            setError("Please set a positive price")
            return
        }

        if(isNaN(revenueShare)){
            setError("Enter an integer between 1 and 100 for reveune share")
            return
        }
        if(revenueShare<0 || revenueShare>100 || !Number.isInteger(Number(revenueShare))){
            setError("Enter an integer between 1 and 100 for reveune share")
            return
        }
        setError(null)

        setProcessing1("true")
        const signerAddress = await signer.getAddress()
        console.log("signerAddress", signerAddress)

        const data = JSON.stringify({
            user: signerAddress, title, price, revenueShare: formInput.revenueShare, image: fileUrl
        })
        


        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`

            createSale(url, signer)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
        
    }

    async function createSale(url, signer) {
        // const web3Modal = new Web3Modal()
        // const connection = await web3Modal.connect()
        // const provider = new ethers.providers.Web3Provider(connection)
        // const signer = provider.getSigner()

        console.log("nftAdd:", nftaddress)

        let contract= new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()
        console.log(tx)
        
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        setProcessing1("done")
        setProcessing2("true")

        let price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(memeitaddress, Memeit.abi, signer)
        transaction = await contract.createNFT(nftaddress, tokenId, formInput.revenueShare, price)

        

        // Add created meme to mongoDB
        // memeId, originalSeller, currentOwner
        tx = await transaction.wait() 
        
        event = tx.events[0]
        value = event.args.memeId
        const memeId = value.toNumber()
        const signerAddress = await signer.getAddress()

        const post = JSON.stringify({
            memeId,
            likes: 0,
            views: 0,
            totalRevenue: 0,
            originalSeller: signerAddress,
            currentOwner: signerAddress,
            revenueShare: formInput.revenueShare,
            revenueGenerated: {}
        })

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        console.log(post)
        setProcessing2("done")

        await axios.post('/post', post, config).then(res => console.log(res)).catch(err => console.log(err))

        

        navigate('/')
    }

    return (
        <div className="grid grid-cols-12">
            <div class="col-span-4 ml-4 mt-36 mr-3">
                <h1 class="text-lg ">After clicking post meme you will be asked to approve 2 transactions</h1>
                <h1 class="mt-3">Transaction 1: For minting NFT {processing1? processing1==="true"? <span class="bg-yellow-500 rounded p-1 ml-2">Processing...</span>:<span class="bg-green-400 rounded p-1 ml-2">Done</span>:null}</h1>
                <h1>Transaction 2: For putting your meme on sale {processing2? processing2==="true"? <span class="bg-yellow-500 rounded p-1 ml-2">Processing...</span>:<span class="bg-green-400 rounded p-1 ml-2">Done</span>:null}</h1>

                <h1 class="mt-4">NFT contract for minting: <a href='https://mumbai.polygonscan.com/address/0x1f3c3587d794ab223644b0619d94Db79777d41dB' target="_blank" class="text-blue-600">NFT contract</a></h1>
                <h1>Platform contract for creating sale: <a href='https://mumbai.polygonscan.com/address/0x13eC2C89EcE4e36F45E4b89eCd79182E8E68a11C' target="_blank" class="text-blue-600">Platform contract</a></h1>
            </div>
            
            <div className="flex flex-col pb-12 col-span-6">

                <h1 className="ml-2 mt-3 text-2xl text-pink-500 mb-4">Create a meme</h1>

                {error? <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong class="font-bold">{error}</strong>

                            <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                                
                            </span>
                            </div>:
                        null
                }
                <input 
                placeholder="Title"
                className="mt-4 border rounded p-4 dark:bg-gray-800  w-96"
                onChange={e => updateFormInput({ ...formInput, title: e.target.value })}
                />
                <div class="flex">

                    <input
                    placeholder="Price in MATIC"
                    className="mt-2 border rounded p-4 dark:bg-gray-800 w-96"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                    /> <h3 class="ml-4 mt-4">Set a low price so others can buy your meme. Ex: 0.1 or 0.025</h3>
                </div>
                <div class="flex">

                    <input
                    placeholder="Percentage revenue for buyer"
                    className="mt-2 border rounded p-4 dark:bg-gray-800  w-96"
                    onChange={e => updateFormInput({ ...formInput, revenueShare: e.target.value })}
                    /><span></span>
                </div>
                <div class="flex">

                    <input
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={onChange}
                    /><span></span>
                </div>
                {
                fileUrl && (
                    <img className="rounded mt-4" width="350" src={fileUrl} />
                )
                }
                <button onClick={createMemeNFT} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg w-80">
                Post meme
                </button>
            </div> 
        </div>
    )
}

export default CreateMeme
