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
        
        return <div>
            {
                Object.keys(revenueShare).map((key, i) => {
                    
                    return(
                    <p key={i}>
                        <span>{key}: {revenueShare[key]}</span>
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
                className="mt-8 border rounded p-2"
                onChange={(e) => setPrice(e.target.value)}
            />
            <button className="bg-red-500 ml-1" onClick = {()=>sellNFT(meme, price)}>Sell meme</button>
        </div>

    

    return (
        <div class=" border-2 border-b-0 p-3 mb-2">
            <h2>{username? username:meme.user}</h2>
            <h2>{meme.title}</h2>
            <img class="mt-2"src={meme.image} />
            <div class="flex space-x-5 mt-3">
                <h3>{meme.likes} Likes</h3>
                <h3>{meme.views} Views</h3>
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
