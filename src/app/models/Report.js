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
    type: Date,
  },
  symptoms: {
    type: [String],
  },
  lab: {
    type: String,
  },
  image: {
    type: String,
    required: [true, `${requiredError} image`],
  },
  isFamilyReport: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Report", reportSchema);
