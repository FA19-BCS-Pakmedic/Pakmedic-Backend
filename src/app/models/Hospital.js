const mongoose = require("mongoose");

const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

const hospitalSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, `${requiredError} hospital name`],
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: [true, `${requiredError} address`],
  },
  image: {
    type: String,
  },
});

module.exports = mongoose.model("Hospital", hospitalSchema);
