const express = require("express");
const notificationController = require("../../controllers/api/NotificationController");

const router = express.Router();

router.post("/send", notificationController.sendNotification);

router
  .route("/")
  .get(notificationController.getNotifications)
  .post(notificationController.registerNotification)
  .patch(notificationController.updateNotification);

module.exports = router;
