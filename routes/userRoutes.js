import express from "express"

import userController from "./../controllers/userController.js"


const router = express.Router()

router
    .route('/:user')
    .get(userController.getUserInfo)

router
    .route('/userProfile')
    .patch(userController.updateUserProfile)

router
    .route('/withdrawAmount')
    .patch(userController.updateWithdrawAmount)

export default router;



