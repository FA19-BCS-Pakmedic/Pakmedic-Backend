const express = require("express");

const {
  createAppointment,
  getAllAppointments,
} = require("../../controllers/api/appointmentController");

const router = express.Router();

router.route("/").post(createAppointment).get(getAllAppointments);

module.exports = router;
