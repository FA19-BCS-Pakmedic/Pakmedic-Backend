// import npm packages
const mongoose = require("mongoose");

// import utils
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

// create schema
const reportSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, `${requiredError} title`],
  },
  date: {
    type: mongoose.Schema.Types.Mixed,
    default: new Date(),
  },
  symptoms: {
    type: String,
  },
  type: {
    type: String,
    required: [true, `${requiredError} type`],
  },
  lab: {
    type: String,
    required: [true, `${requiredError} lab`],
  },
  file: {
    type: String,
    required: [true, `${requiredError} file`],
  },
  isFamilyReport: {
    type: Boolean,
    default: false,
  },
  familyMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
  },
});

module.exports = mongoose.model("Report", reportSchema);
