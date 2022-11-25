// importing npm packages
const express = require("express");
const multer = require("multer");
const path = require("path");

// impporting utils
const roles = require("../../utils/constants/ROLES");

// initializing router
const router = express.Router();

// importing controller
const {
  addService,
  getAllServices,
  getServiceById,
  getSpecificDoctorServices,
  deleteService,
  updateService,
} = require("../../controllers/api/serviceController");

// importing middlewares
const {
  fetchHospital,
  fetchAddress,
  authorizeRole,
  verifyToken,
  singleFileUpload,
} = require("../../middlewares");

/*************** Authorization middle wares *******************************/

router.use(verifyToken);
// router.use(authorizeRole(roles[0], roles[1]));

/****************************** routes **********************/
router.post(
  "/",
  [
    authorizeRole(roles[1]),
    // upload.single("image"),
    singleFileUpload("hospital", "images", "image"),
    fetchAddress,
    fetchHospital,
  ],
  addService
); //this route is only accessible to doctors

router.get("/", [authorizeRole(roles[2])], getAllServices); //this route is only accessible to admin

router
  .route("/:id")
  .get(getServiceById)
  .patch([fetchAddress, fetchHospital], updateService)
  .delete(deleteService); //these routes is accessible to all type of users

router.route("/doctors/:id").get(getSpecificDoctorServices); //this routes is accessible to all type of users

module.exports = router;
