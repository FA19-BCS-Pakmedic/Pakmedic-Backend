// import npm packages
const express = require("express");

// import controller
const {
  createReport,
  getReportsByPatientId,
  getReportById,
  getReportsByFamilyId,
  getReportsOfAllFamilyMembers,
  updateReport,
  deleteReport,
} = require("../../controllers/api/reportController");

// import middlewares
const {
  verifyToken,
  authorizeRole,
  singleFileUpload,
} = require("../../middlewares");

// import utils
const ROLES = require("../../utils/constants/ROLES");

// configure router
const router = express.Router();

// authorization
router.use(verifyToken);
router.use(authorizeRole(ROLES[0])); // for now it is only accessible to the patient themselves, after implementation of the patient's grant permission to access ehr to the doctor functionality this will be replaced

// create a report
router.post("/", [singleFileUpload("report", "images", "image")], createReport); //single file upload should be replaced with multiple files upload issue#42

// search reports by patient id
router.get("/patients", getReportsByPatientId);

// search a report by id
router.get("/:id", getReportById);

// search reports by family member id
router.get("/patients/families/:id", getReportsByFamilyId);

// search reports of family members of a specific patient
router.get("/patients/families", getReportsOfAllFamilyMembers);

// update report
router.patch("/:id", updateReport);

// delete report
router.delete("/:id", deleteReport);

// export router
module.exports = router;
