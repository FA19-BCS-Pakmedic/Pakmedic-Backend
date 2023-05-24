const express = require("express");

const {
  createAppointment,
  getAllAppointments,
  getAppointment,
} = require("../../controllers/api/appointmentController");


const {verifyToken, checkDuplicateAppointment} = require('../../middlewares')

const router = express.Router();

router.use(verifyToken);

router.route("/").post([checkDuplicateAppointment, createAppointment]).get(getAllAppointments);

router.get("/:id", getAppointment);


// router.route('/group-by-months').get(getAppointmentsGroupedByMonths);

module.exports = router;
