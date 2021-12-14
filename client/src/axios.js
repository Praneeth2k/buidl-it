import axios from 'axios'



const baseURL = process.env.baseURL || "http://localhost:8001"
const instance = axios.create({
    baseURL
})

export default instance