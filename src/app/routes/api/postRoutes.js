// npm packages import
const express = require("express");

//import contoller
const {
  addPost,
  getAllPosts,
  getAllPostsForCommunity,
  getPostById,
  updatePost,
  deletePost,
} = require("../../controllers/api/postController");

//import middlewares
const { verifyToken } = require("../../middlewares");

//import utils

// initializing router
const router = express.Router();

// security layer
router.use(verifyToken);

/*****************************ROUTES********************************/

// add a post
router.post("/:cid", addPost);

// get all posts
router.get("/", getAllPosts);

//get all posts for a specific community
router.get("/communities/:cid", getAllPostsForCommunity);

//get a specific post by id
router.get("/:pid", getPostById);

//update a post
router.patch("/:pid", updatePost);

//delete a post by id
router.delete("/:pid", deletePost);

// export router
module.exports = router;
