const express = require("express");
const MLController = require("../../controllers/api/MLController");

const router = express.Router();

router.get("/brainMRI", MLController.brainMRI);
router.get("/chestXray", MLController.chestXray);
router.get("/retinopathy", MLController.retinopathy);
router.get("/riskOfDeath", MLController.riskOfDeath);
router.get("/recommendcompound", MLController.recommendcompound);

module.exports = router;
