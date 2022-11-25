const mongoose = require("mongoose");
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

// const {required}

const addressSchema = mongoose.Schema({
  address: {
    type: String,
    required: [true, , `${requiredError} address`],
  },
  city: {
    type: String,
    required: [true, , `${requiredError} city`],
  },
  state: {
    type: String,
    required: [true, `${requiredError} state`],
  },
  country: {
    type: String,
    required: true,
    default: "Pakistan",
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
});

module.exports = mongoose.model("Address", addressSchema);

// addressSchema.pre('save', (next) => {
//     const coordinates =
// })
