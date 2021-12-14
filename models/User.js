import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
    {
        accountAddress: {
            type: String,
            required: [true, "user must have account address"]
        },
        username: {
            type: String
        },
        totalWithdrawAmount: {
            type: Number
        }
    }
)

const User = mongoose.model('User', userSchema)

export default User