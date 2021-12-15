import mongoose from 'mongoose'

const postSchema = mongoose.Schema(
    {
        memeId: {
            type: Number,
            required: [true, 'A post must have a memeId']
        },
        originalSeller: {
            type: String
        },
        currentOwner: {
            type: String
        },
        likes: {
            type: Number
        },
        views: {
            type: Number
        },
        revenueShare : {
            type: Number
        },
        totalRevenue: {
            type: Number
        },
        revenueGenerated: {
            type: Map,
            of: Number
        },
        deleted: {
            type: Boolean
        }
        
}, {timestamps: true})

const Post = mongoose.model('Post', postSchema);

export default Post;