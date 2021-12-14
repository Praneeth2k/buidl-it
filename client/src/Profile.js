import React, {useState, useEffect} from 'react'
import axios from './axios'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'

import {tokenaddress, memeitaddress} from './config'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'

function Profile() {
    const [revenueEarned, setRevenueEarned] = useState(0.00)
    const [username, setUsername] = useState("")
    const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0)

    useEffect(() => {
        getUserReveune()
    }, [])
    async function getUserReveune() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()

        const result = await axios.get(`/post/userRevenue/${signerAddress}`)
        console.log(result)
        setRevenueEarned(result.data.data.Totalrevenue)

        const userInfo = await axios.get(`/user/${signerAddress}`)
        if(userInfo.data.data){
            let wa = userInfo.data.data.totalWithdrawAmount
            let un = userInfo.data.data.username
            if(!wa){
                wa = 0
            }
            setAlreadyWithdrawn(wa)
            if(!un){
                un = "" 
            }
            setUsername(un)
        }
        console.log(userInfo)
    }

    async function handleSubmit() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()

        //const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)

        const memeitContract = new ethers.Contract(memeitaddress, Memeit.abi, signer)
        await memeitContract.withdrawTokens(tokenaddress, signerAddress, revenueEarned)
        await axios.patch(`/user/withdrawAmount/`, {accountAddress: signerAddress,withdrawAmount: revenueEarned - alreadyWithdrawn})
    }

    async function saveUsername() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()
        // const update = JSON.stringify({
        //     accountAddress: signerAddress,
        //     username
        // })
        await axios.patch('/user/userProfile', {accountAddress: signerAddress,
            username})
    }

    return (
        <div class="ml-16 mt-10">
            <div>
                <h1 class="font-bold text-blue-900"> Set username</h1>
                <input
                    placeholder={username}
                    className="mt-2 border rounded p-2"
                    onChange={e => setUsername(e.target.value)}
                />
                <button className= "bg-blue-500 ml-2 rounded p-1 text-white" onClick={saveUsername}>Save username</button>
            </div>
            <div class="mt-10">
                <h1 class="font-bold text-blue-900">Withdraw tokens to your wallet</h1>
                <h3 class="mt-2 font-mono">You have earned <span class="font-bold text-purple-900">{revenueEarned} BRO</span> Tokens so far</h3>
                <h3 class="mt-1 font-mono">You have already withdrawn <span class="font-bold text-purple-900">{alreadyWithdrawn} BRO</span></h3>
                <h3 class="mt-1 font-mono">Withdrawable: <span class="font-bold text-purple-900">{revenueEarned - alreadyWithdrawn}</span></h3>
                <button onClick = {handleSubmit} className= "bg-red-500 rounded p-1 text-white mt-2">Withdraw {revenueEarned - alreadyWithdrawn}</button> 
            </div>
        </div>
    )
}

export default Profile
