// import npm packages
const express = require("express");

// import controller
const {
  createScan,
  getScanById,
  getScansByPatientId,
  getScansByFamilyId,
  getScansOfAllFamilyMembers,
  updateScan,
  deleteScan,
} = require("../../controllers/api/scanController");

// import middlewares
const {
  authorizeRole,
  verifyToken,
  singleFileUpload,
} = require("../../middlewares");

// import utils
const ROLES = require("../../utils/constants/ROLES");

// initialize router

const router = express.Router();

/*********************************ROUTES***************************************/

// authorization
router.use(verifyToken);
router.use(authorizeRole(ROLES[0])); // for now it is only accessible to the patient themselves, after implementation of the patient's grant permission to access ehr to the doctor functionality this will be replaced

// create a scan
router.post("/", [singleFileUpload("scan", "images", "image")], createScan); //single file upload should be replaced with multiple files upload issue#42

// search scans by patient id
router.get("/patients", getScansByPatientId);

// search a scan by id
router.get("/:id", getScanById);

// search scans by family member id
router.get("/patients/families/:id", getScansByFamilyId);

// search scans of family members of a specific patient
router.get("/patients/families", getScansOfAllFamilyMembers);

// update scan
router.patch("/:id", updateScan);

// delete scan
router.delete("/:id", deleteScan);

// export router
module.exports = router;
