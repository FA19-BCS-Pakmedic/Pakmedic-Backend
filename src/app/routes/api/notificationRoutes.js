const express = require("express");
const notificationController = require("../../controllers/api/NotificationController");

const router = express.Router();

router.post("/send", notificationController.sendNotification);
router.post("/register", notificationController.register);

module.exports = router;
