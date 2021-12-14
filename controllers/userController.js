import catchAsync from "../utils/catchAsync.js"
import User from "./../models/User.js"
import factory from './handlerFactory.js'

const getUserInfo = 
    catchAsync(async(req,res,next) => {
        const accountAddress = req.params.user
        const userProfile = await User.findOne({accountAddress})
        res.status(200).json({
            status: 'success',
            data: userProfile
        })
    })

const updateUserProfile = 
    catchAsync(async(req,res,next) => {
        const accountAddress = req.body.accountAddress
        console.log(req.body)
        const username = req.body.username
        await User.findOneAndUpdate({accountAddress}, {username}, {new:true, upsert:true})
        res.status(200).json({
            status: 'success',
            data: {
                accountAddress,
                username
            }
        })
    })

const updateWithdrawAmount = 
    catchAsync(async(req,res,next) => {
        const accountAddress = req.body.accountAddress
        const withdrawAmount = req.body.withdrawAmount
        const userProfile = await User.findOne({accountAddress})
        console.log(userProfile)
        let newWithdrawAmount
        if(userProfile){
            if(userProfile.totalWithdrawAmount){
                newWithdrawAmount = userProfile.totalWithdrawAmount + withdrawAmount
            } else{
                newWithdrawAmount = withdrawAmount
            }
        } else {
            newWithdrawAmount = withdrawAmount
        }
        await User.findOneAndUpdate({accountAddress}, {"totalWithdrawAmount": newWithdrawAmount}, {new:true, upsert:true})

        res.status(200).json({
            status: 'success',
            totalWithdrawAmount: newWithdrawAmount
        })
    })

export default {getUserInfo, updateUserProfile, updateWithdrawAmount}