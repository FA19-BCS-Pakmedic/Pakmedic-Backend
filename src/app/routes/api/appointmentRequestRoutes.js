const express = require("express");

const {
  createAppointmentReq,

  updateAppointmentReq,
  deleteAppointmentReq,
  getAppointmentReq,
  getAllAppointmentReqs,
} = require("../../controllers/api/appointmentRequestController");

const router = express.Router();

router.route("/").get(getAllAppointmentReqs).post(createAppointmentReq);

router
  .route("/:id")
  .get(getAppointmentReq)
  .patch(updateAppointmentReq)
  .delete(deleteAppointmentReq);

module.exports = router;
