const express = require("express");

const {
  createAppointment,
  getAllAppointments,
  getAppointment,
} = require("../../controllers/api/appointmentController");

const router = express.Router();

router.route("/").post(createAppointment).get(getAllAppointments);

router.get("/:id", getAppointment);


// router.route('/group-by-months').get(getAppointmentsGroupedByMonths);

module.exports = router;
