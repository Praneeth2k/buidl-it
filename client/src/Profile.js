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
        getUserReveune()
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
        <div class="ml-16 mt-10 text-xl">
            <div>
                <h1 class="font-bold"> Set username</h1>
                <input
                    placeholder={username}
                    className="mt-2 border rounded p-2 dark:bg-gray-700"
                    onChange={e => setUsername(e.target.value)}
                />
                <button className= "bg-blue-500 ml-2 rounded-lg p-1 text-white text-base" onClick={saveUsername}>Save username</button>
            </div>
            <div class="mt-20 bg-gray-100 rounded w-max p-4 dark:bg-gray-800">
                <h1 class="font-bold ">Withdraw tokens to your wallet</h1>
                <h3 class="mt-2 font-mono">Earned: <span class="font-bold ">{revenueEarned} BRO</span></h3>
                <h3 class="mt-1 font-mono">Withdrawn: <span class="font-bold ">{alreadyWithdrawn} BRO</span></h3>
                <h3 class="mt-1 font-mono">Withdrawable: <span class="font-bold ">{revenueEarned - alreadyWithdrawn} BRO</span></h3>
                <button onClick = {handleSubmit} className= "bg-red-500 rounded p-1 text-white mt-2 text-base">Withdraw {revenueEarned - alreadyWithdrawn}</button>
                
                <h2 class='mt-3'>BRO Token contract: <a class="text-blue-600" target="_blank" href="https://mumbai.polygonscan.com/address/0x81336889E94B3E48DEE225AD7e3dF0142f793d14">BRO Token</a></h2>
                <h2>Import this token address in your wallet to check if you recieved the tokens: 0x81336889E94B3E48DEE225AD7e3dF0142f793d14</h2>
            </div>
        </div>
    )
}

export default Profile
