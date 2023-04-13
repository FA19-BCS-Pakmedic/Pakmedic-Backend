const mongoose = require("mongoose");
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");
const ROLES = require("../utils/constants/ROLES");

const AppointmentRequestSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  time: {
    type: String,
  },
  date: {
    type: Date,
    default: new Date()
  },
  requestType: {
    type: String,
    enum: ["reschedule", "cancel"],
    required: [true, `${requiredError} requestType`],
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userType",
    required: [true, `${requiredError} receiver`],
  },
  userType: {
    type: String,
    enum: Object.values(ROLES),
  },
  reason: {
    type: String,
    required: [true, `${requiredError} reason`],
  },
  reasonDetails: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isRejected: {
    type: Boolean,
    default: false,
  },
});

AppointmentRequestSchema.pre(/^find/, function (next) {
  this.populate({
    path: "requestedBy",
    select: "-__v",
  }).populate({
    path: "appointment",
    select: "-__v",
  });
  next();
});

module.exports = mongoose.model("AppointmentRequest", AppointmentRequestSchema);
