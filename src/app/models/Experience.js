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
});

module.exports = mongoose.model("Experience", experienceSchema);
