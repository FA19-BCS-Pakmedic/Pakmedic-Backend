const express = require("express");

const {
  createReminder,
  getAllReminders,
  printReminder,
} = require("../../controllers/api/reminderController");

const router = express.Router();

router.route("/").post(createReminder).get(getAllReminders);

router.route("/print").get(printReminder);

// router.route('/group-by-months').get(getAppointmentsGroupedByMonths);

module.exports = router;
