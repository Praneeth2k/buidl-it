import axios from 'axios'



const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:8001"
const instance = axios.create({
    baseURL
})

export default instance