import React, { useState, useEffect } from 'react'
import axios from './axios'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
function Navbar() {

    const [revenueEarned, setRevenueEarned] = useState(0.00)
    const [username, setUsername] = useState()

    useEffect(() => {
        getUserReveune()
    })
    async function getUserReveune() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()

        const result = await axios.get(`/post/userRevenue/${signerAddress}`)
        console.log(result)
        setRevenueEarned(result.data.data.Totalrevenue)
    }
    return (
        <div class="bg-blue-400">
            <div class="ml-5 flex flex-row sm:">
                <div class="flex-grow">
                    <img className="mt-2 w-16 md:w-24" src="./memeit.png"/>
                    <div className="mt-2 text-white space-x-3 sm:space-x-5">
                        <a href="/">Home</a>
                        <a href="/create-meme">Create meme</a>
                        <a href="/mymemes">My memes</a>
                        <a href="/mycollection">My collection</a>
                        <a href="/faucet">Faucet</a>
                        <a href="/profile">My Profile</a>
                    </div>
                </div>
                <div class="m-2 p-3 bg-indigo-50">
                    <h3 class="mb-6">Your Earnings: {revenueEarned} BRO</h3>
                </div>
            </div>
        </div>
    )
}

export default Navbar
