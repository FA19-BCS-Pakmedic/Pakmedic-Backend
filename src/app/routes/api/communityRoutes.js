// npm packages import
const express = require("express");
const {
  addCommunity,
  getAllCommunities,
  updateCommunity,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  deleteCommunity
} = require("../../controllers/api/communityController");

//import controller functions

//import middlewares
const { verifyToken } = require("../../middlewares");

//import utils

// initializing router
const router = express.Router();

/***********************ROUTES*********************/

router.use(verifyToken);

//add a community
router.post("/", addCommunity);

//get all communities
router.get("/", getAllCommunities);

//get a community by id
router.get("/:id", getCommunityById);

//update a community
router.patch("/:id", updateCommunity);

//join a community
router.patch("/join/:id", joinCommunity);

//leave a community
router.patch("/leave/:id", leaveCommunity);

//delete a community

router.delete("/:id", deleteCommunity);



// // security layer
// router.use(verifyToken);

module.exports = router;
