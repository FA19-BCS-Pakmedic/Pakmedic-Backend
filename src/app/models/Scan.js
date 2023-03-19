// import npm packages
const mongoose = require("mongoose");

// import utils
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

// create schema
const scanSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, `${requiredError} title`],
  },
  date: {
    type: Date,
    default: new Date(),
  },
  image: {
    type: String,
    required: [true, `${requiredError} image`],
  },
  
  isFamilyScan: {
    type: Boolean,
    default: false,
  },

  familyMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family'
  }

});

module.exports = mongoose.model("Scan", scanSchema);
