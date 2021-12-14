import React, {useState, useEffect} from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from 'web3modal'

import { useNavigate } from 'react-router-dom'


import {
    nftaddress, memeitaddress
} from './config'

import NFT from './artifacts/src/contracts/NFT.sol/NFT.json'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'
import axios from './axios'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

function CreateMeme() {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', title: '', revenueShare: 0.00})

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
        const { title, price } = formInput
        if(!title || !price || !fileUrl) return

        const signerAddress = await signer.getAddress()

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

        let contract= new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()
        console.log(tx)
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

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

        await axios.post('/post', post, config).then(res => console.log(res)).catch(err => console.log(err))
        

        navigate('/')
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <h1 className="ml-2 mt-3 text-2xl text-pink-500">Create a meme</h1>
                <input 
                placeholder="Title"
                className="mt-4 border rounded p-4"
                onChange={e => updateFormInput({ ...formInput, title: e.target.value })}
                />
                <input
                placeholder="Price in MATIC"
                className="mt-2 border rounded p-4"
                onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                <input
                placeholder="Percentage revenue for buyer"
                className="mt-2 border rounded p-4"
                onChange={e => updateFormInput({ ...formInput, revenueShare: e.target.value })}
                />
                <input
                type="file"
                name="Asset"
                className="my-4"
                onChange={onChange}
                />
                {
                fileUrl && (
                    <img className="rounded mt-4" width="350" src={fileUrl} />
                )
                }
                <button onClick={createMemeNFT} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                Post meme
                </button>
            </div> 
        </div>
    )
}

export default CreateMeme
