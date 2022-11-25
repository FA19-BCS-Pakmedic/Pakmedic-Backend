// npm packages import
const express = require("express");
// const multer = require("multer");
// const path = require("path");
const { check } = require("express-validator");

// controller functions import
const {
  verifyDoctor,
  register,
  login,
  forgotPassword,
  resetForgottenPassword,
  resetPassword,
  facebookLogin,
  googleLogin,
  addTreatment,
  removeTreatment,
  findDoctorByTreatment,
  addESign,
  removeESign,
  getESign,
  updateESign,
  updateDoctor,
  deleteDoctor,
  updateProfileImage,
  findDoctorById,
  findDoctorsByHospital,
  removeProfileImage,
  findDoctors,
  addUpdateAbout,
  removeAbout,
} = require("../../controllers/api/doctorController");
const { verifyPatient } = require("../../controllers/api/patientController");

// middleware imports
const {
  checkDuplicateDoctor,
  verifyToken,
  authorizeRole,
  doctorDataValidator,
  checkDuplicatePmc,
  singleFileUpload,
  deleteDoctorEmbeddedDocs,
} = require("../../middlewares");

// import utils
const { passwordRegex, stringRegex } = require("../../utils/constants/REGEX");
const {
  invalidEmail,
  invalidPassword,
  containOnlyAlphabets,
} = require("../../utils/constants/RESPONSEMESSAGES");
const roles = require("../../utils/constants/ROLES");

// initializing router
const router = express.Router();

/*****************************ROUTES********************************/

// verify doctor pmc id
router.post("/pmc/verify", [checkDuplicatePmc], verifyDoctor);

// register a doctor
router.post(
  "/register",
  [
    singleFileUpload("avatar", "images", "avatar"),
    doctorDataValidator,
    checkDuplicateDoctor,
  ],
  register
);

// verify user account
router.get("/verify/:id", verifyDoctor);

// login a doctor
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

// find doctors by hospital
router.get("/hospitals", findDoctorsByHospital);

// middlewares to verify users
router.use(verifyToken);

// find doctors
router.get("/:id", verifyToken, findDoctorById);
router.get("/", findDoctors);

router.use(authorizeRole(roles[1]));

//reset Password
router.patch("/reset-password", [
  check("email", invalidEmail).isEmail(),
  check("password", invalidPassword).matches(passwordRegex),
  resetPassword,
]);

/**************************DOCTOR CRUD OPERATION ROUTES*********************/
// update and delete profile routes
router
  .route("/")
  .patch([doctorDataValidator], updateDoctor)
  .delete([deleteDoctorEmbeddedDocs], deleteDoctor);

// update profile image route
// router.patch(
//   "/avatar",
//   [singleFileUpload("avatar", "images", "avatar")],
//   updateProfileImage
// );

router
  .route("/avatar")
  .patch([singleFileUpload("avatar", "images", "avatar")], updateProfileImage)
  .delete(removeProfileImage);

/*******************************DOCTOR's TREATEMENT****************/
router
  .route("/treatments")
  .post(
    [check("treatment", containOnlyAlphabets).matches(stringRegex)],
    addTreatment
  )
  .delete(removeTreatment)
  .get(findDoctorByTreatment); //find the doctor based on a specific treatment

/***************************DOCTOR's E-SIGN**************************/
router
  .route("/e-signs")
  .post([singleFileUpload("sign", "images", "e-sign")], addESign)
  .get(getESign)
  .delete(removeESign)
  .patch([singleFileUpload("sign", "images", "e-sign")], updateESign);

/***************************DOCTOR's ABOUT**************************/
router
  .route("/about")
  .post(addUpdateAbout)
  .patch(addUpdateAbout)
  .delete(removeAbout);

module.exports = router;
