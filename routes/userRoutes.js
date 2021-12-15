import express from "express"

import userController from "./../controllers/userController.js"


const router = express.Router()


router
    .route('/userProfile')
    .patch(userController.updateUserProfile)


router
    .route('/withdrawAmount')
    .patch(userController.updateWithdrawAmount)

router
    .route('/:user')
    .get(userController.getUserInfo)





export default router;



