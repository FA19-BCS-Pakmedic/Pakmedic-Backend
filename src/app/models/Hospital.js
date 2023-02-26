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

//pre find hook to populate address
hospitalSchema.pre(/^find/, function (next) {
  this.populate({
    path: "address",
    select: "-__v",
  });
  next();
});

module.exports = mongoose.model("Hospital", hospitalSchema);
