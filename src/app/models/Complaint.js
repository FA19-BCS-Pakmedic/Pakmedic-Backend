const mongoose = require("mongoose");
const ROLES = require("../utils/constants/ROLES");

const complaintSchema = mongoose.Schema({
  complaineeType: {
    type: String,
    enum: Object.values(ROLES),
  },
  complainantType: {
    type: String,
    enum: Object.values(ROLES),
  },
  complainee: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "complaineeType",
    required: true,
  },
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "complainantType",
    required: true,
  },
  status: {
    type: String,
    enum: ["On Hold", "Resolved", "Pending"],
    default: "Pending",
  },
  subject: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["Comment", "Post", "General"],
    default: "General",
  },
  complaint: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  ticketNumber: {
    type: String,
    required: true,
    default: Math.floor(100000 + Math.random() * 900000),
  },
  review: {
    type: String,
  },
});

// prefill complainee and complainant feilds before finding
complaintSchema.pre(/^find/, function (next) {
  this.populate({
    path: "complainee",
    select: "-__v",
  }).populate({
    path: "complainant",
    select: "-__v",
  });
  next();
});

module.exports = mongoose.model("Complaint", complaintSchema);
