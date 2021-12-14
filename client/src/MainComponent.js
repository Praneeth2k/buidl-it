import React from 'react'
import Memes from './Memes'
import CreateMeme from './CreateMeme'
import { Route, Routes} from 'react-router-dom'
import MyMemes from './MyMemes'
import MyCollection from './MyCollection'
import Faucet from './Faucet'
import Profile from './Profile'

function MainComponent() {
    return (
        <Routes>
            <Route path = "/" element = {<Memes />} />          
            <Route path = "/create-meme" element = {<CreateMeme />} />
            <Route path = "/mymemes" element = {<MyMemes />} />  
            <Route path = "/mycollection" element = {<MyCollection />} />  
            <Route path = "/faucet" element = {<Faucet />} />  
            <Route path = "/profile" element = {<Profile />} /> 

        </Routes>
    )
}

export default MainComponent
