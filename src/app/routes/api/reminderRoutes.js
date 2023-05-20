const express = require("express");

const {
  createReminder,
  getAllReminders,
} = require("../../controllers/api/reminderController");

const router = express.Router();

router.route("/").post(createReminder).get(getAllReminders);

// router.route('/group-by-months').get(getAppointmentsGroupedByMonths);

module.exports = router;
