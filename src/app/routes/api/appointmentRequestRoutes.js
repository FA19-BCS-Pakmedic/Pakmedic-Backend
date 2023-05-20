const express = require("express");

const {
  createAppointmentReq,

  updateAppointmentReq,
  deleteAppointmentReq,
  getAppointmentReq,
  getAllAppointmentReqs,
} = require("../../controllers/api/appointmentRequestController");

const { verifyToken } = require("../../middlewares");

const router = express.Router();

// router.use(verifyToken);

router.route("/").get(getAllAppointmentReqs).post(createAppointmentReq);

router
  .route("/:id")
  .get(getAppointmentReq)
  .patch(updateAppointmentReq)
  .delete(deleteAppointmentReq);

module.exports = router;
