// npm packages import
const express = require("express");

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
  verifyDoctorPMC,
  verifyOTP,
  getDoctor,
  addAvatar,
  getAvatar,
  // getAvatar,
} = require("../../controllers/api/doctorController");

// middleware imports
const {
  checkDuplicateDoctor,
  verifyToken,
  authorizeRole,
  doctorDataValidator,
  checkDuplicatePmc,
  singleFileUpload,
  deleteDoctorEmbeddedDocs,
  upload,
  uploadSingle,
} = require("../../middlewares");

// import utils
const { passwordRegex, stringRegex } = require("../../utils/constants/REGEX");
const {
  invalidEmail,
  invalidPassword,
  containOnlyAlphabets,
} = require("../../utils/constants/RESPONSEMESSAGES");
const ROLES = require("../../utils/constants/ROLES");

// initializing router
const router = express.Router();

/*****************************ROUTES********************************/

// verify doctor pmc id
router.post("/pmc/verify", [checkDuplicatePmc], verifyDoctorPMC);

// register a doctor
router.post("/register", [doctorDataValidator, checkDuplicateDoctor], register);

// verify user account
router.get("/verify/:id", verifyDoctor);

// login a doctor
router.post("/login", login);

// third party login routes
// router.post("/login/facebook", facebookLogin);
// router.post("/login/google", googleLogin);

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

// find doctors by hospital
router.get("/hospitals", findDoctorsByHospital);

// middlewares to verify users
router.use(verifyToken);

// find doctors
router.get("/find", findDoctors);
router.get("/:id", findDoctorById);

router.use(authorizeRole(ROLES[1]));

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
  .get(getDoctor)
  // .patch([doctorDataValidator], updateDoctor)
  .patch(updateDoctor)
  .delete([deleteDoctorEmbeddedDocs], deleteDoctor);

router
  .route("/avatar")
  .post([uploadSingle()], addAvatar)
  .patch([singleFileUpload("avatar", "images", "avatar")], updateProfileImage)
  .delete(removeProfileImage);

// router.get("/avatar/:filename", getAvatar);

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
  .route("/signatures")
  .post([uploadSingle()], addESign)
  .get(getESign)
  .delete(removeESign)
  .patch([singleFileUpload("sign", "images", "e-sign")], updateESign);

/***************************DOCTOR's ABOUT**************************/
router
  .route("/about")
  .post(addUpdateAbout)
  .patch(addUpdateAbout)
  .delete(removeAbout);

/*******************************DOCTOR's SIGNATURE *********************/

module.exports = router;
