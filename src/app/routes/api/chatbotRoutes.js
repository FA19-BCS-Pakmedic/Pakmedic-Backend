// npm packages import
const express = require("express");

const router = express.Router();

const {
  chatWithBot,
  findSpecialists,
} = require("../../controllers/api/chatbotController");

// chat with bot
router.post("/chat", chatWithBot);

// find doctors
router.get("/specialists", findSpecialists);

module.exports = router;
