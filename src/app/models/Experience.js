// importing npm packages
const mongoose = require("mongoose");

// importing utils
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

const experienceSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, `${requiredError} title`],
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: [true, `${requiredError} hospital`],
  },
  from: {
    type: Date,
    required: [true, `${requiredError} from date`],
  },
  to: {
    type: Date,
    required: [true, `${requiredError} to date`],
  },
});

// pre populate the hospital field
experienceSchema.pre(/^find/, function (next) {
  this.populate({
    path: "hospital",
    select: "-__v",
  });
  next();
});

module.exports = mongoose.model("Experience", experienceSchema);
