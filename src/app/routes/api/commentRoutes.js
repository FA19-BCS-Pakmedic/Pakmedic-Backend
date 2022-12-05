// npm packages import
const express = require("express");

//import controller functions
const {
  addComment,
  getAllComments,
  getAllCommentsForPost,
  deleteComment,
} = require("../../controllers/api/commentController");

//import middlewares
const { verifyToken } = require("../../middlewares");

//import utils

// initializing router
const router = express.Router();

// security layer
router.use(verifyToken);

/*****************************ROUTES********************************/

// add a comment
router.post("/:pid", addComment);

// get all comments
router.get("/", getAllComments);

//get all comments for a specific post
router.get("/posts/:pid", getAllCommentsForPost);

//delete a comment by id
router.delete("/:cid", deleteComment);

// export router
module.exports = router;
