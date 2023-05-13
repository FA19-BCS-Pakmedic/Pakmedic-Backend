const express = require("express");

const router = express.Router();

const { getFile, addFile } = require("../../controllers/api/filesController");
const { uploadSingle } = require("../../middlewares");

router.get("/:filename", getFile);

router.post("/", [uploadSingle()], addFile);

module.exports = router;
