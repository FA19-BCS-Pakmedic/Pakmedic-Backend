const express = require("express");

const router = express.Router();

const { getFile } = require("../../controllers/api/filesController");

router.get("/:filename", getFile);

module.exports = router;
