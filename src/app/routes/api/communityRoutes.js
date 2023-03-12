// npm packages import
const express = require("express");
const {
  addCommunity,
  getAllCommunities,
  updateCommunity,
  getCommunityById,
} = require("../../controllers/api/communityController");

//import controller functions

//import middlewares
const { verifyToken } = require("../../middlewares");

//import utils

// initializing router
const router = express.Router();

/***********************ROUTES*********************/

//add a community
router.post("/", addCommunity);

//get all communities
router.get("/", getAllCommunities);

//get a community by id
router.get("/:id", getCommunityById);

//update a community
router.patch("/:id", updateCommunity);

//delete a community
// router.delete("/:cid", deleteCommunity);

// // security layer
// router.use(verifyToken);

module.exports = router;
