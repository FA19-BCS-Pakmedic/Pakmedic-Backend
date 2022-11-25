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
} = require("../../controllers/api/patientController");

// import middlewares
const {
  checkDuplicatePatient,
  verifyToken,
  authorizeRole,
  patientRegistrationValidator,
  fetchAddress,
  singleFileUpload,
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

// register a patient
router.post(
  "/register",
  [
    singleFileUpload("avatar", "images", "avatar"),
    patientRegistrationValidator,
    checkDuplicatePatient,
    fetchAddress,
  ],
  register
);

// verify user account
router.get("/verify/:id", verifyPatient);

// login a patient
router.post("/login", login);

// third party login routes
router.post("/login/facebook", facebookLogin);
router.post("/login/google", googleLogin);

// get a validation token to reset a forgotten password
router.patch(
  "/forgot-password",
  [check("email", invalidEmail).isEmail()],
  forgotPassword
);
// reset a forgotten password
router.patch(
  "/reset-forgotten-password",
  [check("password", invalidPassword).matches(passwordRegex)],
  resetForgottenPassword
);

// middlewares to verify users
router.use(verifyToken);

//reset Password
router.patch("/reset-password", [
  check("email", invalidEmail).isEmail(),
  check("password", invalidPassword).matches(passwordRegex),
  resetPassword,
]);

router.use(authorizeRole(ROLES[0]));

// patient routes to get, update users
router.route("/:id").get(getPatient);

router
  .route("/avatar")
  .patch([singleFileUpload("avatar", "images", "avatar")], updateProfileImage)
  .delete(removeProfileImage);

router
  .route("/")
  .patch([patientRegistrationValidator, fetchAddress], updatePatient)
  .delete([deletePatientEmbeddedDocs], deletePatient);
module.exports = router;
