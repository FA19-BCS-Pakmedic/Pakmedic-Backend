const express = require("express");
const MLController = require("../../controllers/api/MLController");

const router = express.Router();

router.get("/brainMRI", MLController.brainMRI);
router.get("/chestXray", MLController.chestXray);
router.post("/retinopathy", MLController.retinopathy);
router.post("/riskOfDeath", MLController.riskOfDeath);
router.post("/recommendcompound", MLController.recommendcompound);

module.exports = router;
