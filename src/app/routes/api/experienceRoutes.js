// importing npm packages
const express = require("express");

// impporting utils
const roles = require("../../utils/constants/ROLES");

// initializing router
const router = express.Router();

// importing controller
const {
  addExperience,
  getAllExperiences,
  getExperienceById,
  getSpecificDoctorExperiences,
  updateExperience,
  deleteExperience,
} = require("../../controllers/api/experienceController");

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

/****************************** routes **********************/
router.post(
  "/",
  [
    authorizeRole(roles[1]),
    singleFileUpload("hospital", "images", "image"),
    fetchAddress,
    fetchHospital,
  ],
  addExperience
); //this route is only accessible to doctors
// .get(getAllExperiences);

router.get("/", [authorizeRole(roles[2])], getAllExperiences); //this route is only accessible to admin

router
  .route("/:id")
  .get(getExperienceById)
  .patch([fetchAddress, fetchHospital], updateExperience)
  .delete(deleteExperience); //these routes is accessible to all type of users

router.route("/doctors/:id").get(getSpecificDoctorExperiences); //this routes is accessible to all type of users
module.exports = router;
