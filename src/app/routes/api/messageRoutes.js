const express = require("express");

const { getMessages } = require("../../controllers/api/chatController");

const router = express.Router();

router.get("/:roomId", getMessages);

module.exports = router;
