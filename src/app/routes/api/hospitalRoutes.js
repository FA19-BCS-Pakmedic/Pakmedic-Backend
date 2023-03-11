// import npm packages
const express = require("express");

// importing controller
const {
  getAllHospitals,
  createHospital,
  getHospitalById,
  updateHospital,
  deleteHospital,
} = require("../../controllers/api/hospitalController");

// importing middlewares
const { fetchAddress, singleFileUpload } = require("../../middlewares");

// initializing router
const router = express.Router();

/**************************ROUTES***************************/

router
  .route("/")
  .get(getAllHospitals)
  .post(
    [singleFileUpload("hospital", "images", "image"), fetchAddress],
    createHospital
  );

router
  .route("/:id")
  .get(getHospitalById)
  .patch(updateHospital)
  .delete(deleteHospital);

module.exports = router;
