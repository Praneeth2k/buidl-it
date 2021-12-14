import React, {useState} from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

import {tokenaddress, memeitaddress} from './config'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'

let rpcEndpoint = null

if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
    rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL
} 

function Faucet() {
    const [formInput, setFormInput] = useState({address: ""})

    

    async function handleSubmit() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        //const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)

        const memeitContract = new ethers.Contract(memeitaddress, Memeit.abi, signer)
        await memeitContract.faucet(tokenaddress, formInput.address)
    }

    return (
        <div class="m-4">
            <h1>Get 100 free Bro tokens</h1>

            <input
                placeholder="Your wallet address"
                className="mt-2 border rounded p-2"
                onChange={e => setFormInput({ ...formInput, address: e.target.value })}
            />

            <button class="bg-red-500 rounded p-1 text-white mt-2 ml-2" onClick = {handleSubmit}>Get BRO Tokens</button>

            <h1 class="mt-2">You will have to pay the gas fees to get the BRO tokens</h1>

        </div>
    )
}

export default Faucet
