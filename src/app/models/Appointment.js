const mongoose = require("mongoose");
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");
const status = require("../utils/constants/APPOINTMENTSTATUS");

const appointmentSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
  },
  date: {
    type: Date,
    required: [true, `${requiredError} date`],
    default: new Date(),
  },
  time: {
    type: String,
    required: [true, `${requiredError} time`],
  },
  is_paid: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: status,
    default: status[0],
  },
  patient_note: {
    type: String,
    default: "",
  },
  reject_reason: {
    type: String,
    // TODO: Add an enum
    default: "",
  },
});

// add a pre find query to populate doctor, patient and service
appointmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "doctor",
    select: "-__v",
  })
    .populate({
      path: "patient",
      select: "-__v",
    })
    .populate({
      path: "service",
      select: "-__v",
    });
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);
