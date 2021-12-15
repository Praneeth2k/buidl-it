import Post from "./models/Post.js"
import postController from "./controllers/postController.js"

const updateData = async () => {
    const likes = Math.floor(Math.random() * 10);
    const views = Math.floor(likes + Math.random() * 10);
    var u = {"revenueGenerated": {}}
    const amount = 2 * likes + views

    await Post.updateMany({}, { $inc: { 'views':views, 'likes': likes, 'totalRevenue': amount } })

    const posts = await Post.find()

    posts.forEach(async(post) => {

        const originalSellerShare = amount * (100 - post.revenueShare) / 100
        const ownerShare = amount - originalSellerShare
        const originalSeller = post.originalSeller
        const currentOwner = post.currentOwner

        const revenueGenerated = post.revenueGenerated

        const updatedRevenueGenerated = {}
        
        if(revenueGenerated.get(originalSeller)) {
            updatedRevenueGenerated[originalSeller] = revenueGenerated.get(originalSeller) + originalSellerShare
        } else {
            updatedRevenueGenerated[originalSeller] = originalSellerShare
        }
        if(revenueGenerated.get(currentOwner)) {
            if(currentOwner === originalSeller){
                updatedRevenueGenerated[currentOwner] += ownerShare 
            } else{
            updatedRevenueGenerated[currentOwner] = revenueGenerated.get(currentOwner) + ownerShare
            }
        } else {
            if(currentOwner === originalSeller){
                updatedRevenueGenerated[currentOwner] += ownerShare 
            } else{
            updatedRevenueGenerated[currentOwner] = ownerShare
            }
        }

        
        await Post.updateOne({_id: post._id}, {'revenueGenerated': updatedRevenueGenerated})
    })
}

export default updateData