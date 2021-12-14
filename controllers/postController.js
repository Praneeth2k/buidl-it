
import catchAsync from "../utils/catchAsync.js"
import Post from "./../models/Post.js"
import factory from './handlerFactory.js'
const getAllPosts = factory.getAll(Post)
const getPost = factory.getOne(Post)
const createPost = factory.createOne(Post)
const updatePost = factory.updateOne(Post)

const getUserRevenue = 
    catchAsync(async(req,res,next) => {
        const user = req.params.user

        console.log("Checkpoint 3")

        const posts = await Post.find()
        let totalSum = 0.0
    
        posts.forEach(async(post) => {
            if(post.revenueGenerated.get(user)){
                totalSum += post.revenueGenerated.get(user)
            }
        })
        res.status(200).json({
            status: 'success',
            data: {
                user,
                Totalrevenue: totalSum
            }
        })
        
    })



export default {getAllPosts, getPost, createPost, updatePost, getUserRevenue}