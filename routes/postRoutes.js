import express from "express"

import postController from "./../controllers/postController.js"

const router = express.Router();


router
  .route('/')
  .get(postController.getAllPosts)
  .post(postController.createPost)

router
  .route('/:id')
  .get(postController.getPost)
  .patch(postController.updatePost)

router
  .route('/userRevenue/:user')
  .get(postController.getUserRevenue)

export default router;


