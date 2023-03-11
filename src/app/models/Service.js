// import npm packages
const mongoose = require("mongoose");

// import utils
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");
const DAYS = require("../utils/constants/DAYS");

//creating schema
const serviceSchema = mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
  },
  fee: {
    type: Number,
    required: [true, `${requiredError} fee amount`],
  },
  days: {
    type: [String],
    required: [true, `${requiredError} days`],
    enum: Object.values(DAYS),
  },
  availFrom: {
    type: String,
    required: [true, `${requiredError} availability time from`],
  },
  availTo: {
    type: String,
    required: [true, `${requiredError} availability time to`],
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
});

//pre find hook to populate hospital
serviceSchema.pre(/^find/, function (next) {
  this.populate({
    path: "hospital",
    select: "-__v",
  });
  next();
});

module.exports = mongoose.model("Service", serviceSchema);
