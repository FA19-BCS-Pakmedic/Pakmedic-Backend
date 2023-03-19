const express = require("express");
const notificationController = require("../../controllers/api/NotificationController");

const router = express.Router();

router.post("/send", notificationController.sendNotification);
router.post("/register", notificationController.registerNotification);
router.post("/update", notificationController.updateNotification);

module.exports = router;
