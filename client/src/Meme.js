import React, {useState, useEffect} from 'react'
import axios from './axios'
function Meme(props) {
    let meme = props.meme
    let buyNFT = props.buyNFT
    let sellNFT = props.sellNFT
    const revenueShare = meme.revenueShare

    const [price, setPrice] = useState(null)
    const [username, setUsername] = useState(null)

    useEffect(() => {
        getUsername()
    }, [])

    async function getUsername() {
        const u = await axios.get(`/user/${meme.user}`)
        if(u.data.data){
            setUsername(u.data.data.username)
        }
    }

    function renderBottom() {
        if(props.option === "1"){
            return buyMeme
        } else if(props.option === "3"){
            return sellMeme
        } else return null
    }

    // async function getRevenue(address){
    //     const u = await axios.get(`/user/${address}`)
    //     if(u.data.data){
    //         return u.data.data.username
    //     } else return address
    // }

    function revenueDistribution() {
        if(!revenueShare){
            return null
        }
        
        return <div class="mt-2 mb-2">
            <h2 class="font-semibold">Revenue distribution (Total: {meme.totalRevenue} BRO)</h2>
            {
                Object.keys(revenueShare).map((key, i) => {
                    
                    return(
                    <p key={i}>
                        <span>{key}: {revenueShare[key]} BRO</span>
                    </p>
                )})
            }
            
        </div>
    }

    const buyMeme = 
        <div class = "mt-1">
            {meme.sold? <h3>Meme not for sale</h3>:
            <button className="bg-red-500 rounded p-2" onClick = {()=>buyNFT(meme)}>Buy meme</button>
            }
        </div>

    // const  = 
    //     <div>
    //         <button className="bg-red-500" onClick = {()=>buyNFT(meme)}>Buy meme</button>
    //     </div>

    const sellMeme = 
        <div class = "mt-1">
            <input 
                placeholder="Set Price"
                className="mt-8 border rounded p-2 bg-gray-700"
                onChange={(e) => setPrice(e.target.value)}
            />
            <button className="bg-red-500 ml-1" onClick = {()=>sellNFT(meme, price)}>Sell meme</button>
        </div>

    

    return (
        <div class="border-gray-200 border-b-2 p-10 pb-3  hover:bg-gray-50 dark:hover:bg-gray-900 ">
            <h2 class="font-semibold text-lg">{username? username:meme.user}</h2>
            <h2 class="">{meme.title}</h2>
            <img class="mt-2 rounded-md"src={meme.image} />
            <div class="flex space-x-5 mt-3">
                <div class="flex hover:translate-y-2">
                    <h3 class="text-blue-600">{meme.likes} </h3>
                    <svg class="ml-1 h-5 w-5 text-blue-500"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                </div>

                <div class="flex">
                    <h3 class="text-green-600">{meme.views}</h3>
                    <svg class="ml-1 h-5 w-5 text-green-500"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />  <circle cx="12" cy="12" r="3" /></svg>
                </div>

                <h3>Price: {meme.price} MATIC</h3>
                <h3>Revenue share: {meme.percentageRevenue}% </h3>
            </div>
            
            {revenueDistribution()}
            
            {
                renderBottom()
            }
        </div>
    )
}

export default Meme
