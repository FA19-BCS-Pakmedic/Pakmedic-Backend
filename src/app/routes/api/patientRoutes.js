// importing npm packages
const express = require("express");
const multer = require("multer");
const path = require("path");
const { check } = require("express-validator");

// importing controllers
const {
  register,
  login,
  updatePatient,
  getPatient,
  forgotPassword,
  resetForgottenPassword,
  resetPassword,
  googleLogin,
  facebookLogin,
  verifyPatient,
  deletePatient,
  removeProfileImage,
  updateProfileImage,
  verifyOTP,
  getPatientById,
  addAvatar,
  getPatients,
  handleEhrRequest
} = require("../../controllers/api/patientController");

// import middlewares
const {
  checkDuplicatePatient,
  verifyToken,
  authorizeRole,
  patientRegistrationValidator,
  fetchAddress,
  singleFileUpload,
  uploadSingle,
  checkUserStatus,
} = require("../../middlewares");

// import utils
const { passwordRegex } = require("../../utils/constants/REGEX");
const ROLES = require("../../utils/constants/ROLES");
const {
  invalidEmail,
  invalidPassword,
} = require("../../utils/constants/RESPONSEMESSAGES");
const deletePatientEmbeddedDocs = require("../../middlewares/deletePatientEmbeddedDocs");

// initializing router
const router = express.Router();

/*****************************ROUTES********************************/

//get all patients
router.get("/all", getPatients);

// register a patient
router.post(
  "/register",
  [
    // singleFileUpload("avatar", "images", "avatar"),
    patientRegistrationValidator,
    checkDuplicatePatient,
    fetchAddress,
  ],
  register
);

// verify user account
router.get("/verify/:id", verifyPatient);

// login a patient
router.post("/login", [checkUserStatus("patient")], login);

// third party login routes
router.post("/login/facebook", facebookLogin);
router.post("/login/google", googleLogin);

// get a validation token to reset a forgotten password
router.patch(
  "/forgot-password",
  [check("email", invalidEmail).isEmail()],
  forgotPassword
);

// verify otp
router.get("/verify-otp", verifyOTP);

// reset a forgotten password
router.patch(
  "/reset-forgotten-password",
  [check("password", invalidPassword).matches(passwordRegex)],
  resetForgottenPassword
);

// middlewares to verify users
router.use(verifyToken);


router.post("/ehr-access", handleEhrRequest);

//reset Password
router.patch("/reset-password", [
  check("email", invalidEmail).isEmail(),
  check("password", invalidPassword).matches(passwordRegex),
  resetPassword,
]);

// router.use(authorizeRole(ROLES[0])); //TODO: PLACE THIS IN AN APPROPRIATE PLACE

// patient routes to get, update users
router.route("/:id").get(getPatientById);

router
  .route("/avatar")
  .post([uploadSingle()], addAvatar)
  .patch([singleFileUpload("avatar", "images", "avatar")], updateProfileImage)
  .delete(removeProfileImage);

router
  .route("/")
  .get([checkUserStatus("patient")], getPatient)
  .patch(updatePatient)
  .delete([deletePatientEmbeddedDocs], deletePatient);

module.exports = router;
