const mongoose = require("mongoose");

// importing utils
const CITIES = require("../utils/constants/CITIES");
const ROLES = require("../utils/constants/ROLES");
const GENDERS = require("../utils/constants/GENDERS");
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

// import nested schemas
const pmcSchema = require("./NestedSchemas/PmcData")(mongoose);

const doctorSchema = mongoose.Schema({
  //authentication data
  email: {
    type: String,
    required: [true, `${requiredError} email`],
  },
  password: {
    type: String,
    required: [true, `${requiredError} password`],
    select: false,
  },
  role: {
    type: String,
    required: [true, `${requiredError} role`],
    enum: Object.values(ROLES),
  },

  //general information
  name: {
    type: String,
    required: [true, `${requiredError} name`],
  },
  phone: {
    type: String,
    required: [true, `${requiredError} phone number`],
  },
  dob: {
    type: Date,
    required: [true, `${requiredError} date of birth`],
  },
  gender: {
    type: String,
    required: [true, `${requiredError} gender`],
    enum: Object.values(GENDERS),
  },
  location: {
    type: String,
    required: [true, `${requiredError} location`],
    enum: Object.values(CITIES),
  },
  avatar: {
    type: String,
    required: [true, `${requiredError} avatar`],
  },

  //pmc data
  pmc: {
    type: pmcSchema,
    required: [true, `${requiredError} pmc details`],
  },

  //doctor specific information
  speciality: {
    type: String,
    required: [true, `${requiredError} specialty`],
  },
  about: {
    type: String,
  },
  experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: "Experience" }],
  treatments: {
    type: [String],
  },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  eSign: {
    type: String,
  },
  communities: {
    type: [String],
  },
  reviews: {
    type: [String],
  },

  //account verification
  isVerified: {
    type: Boolean,
    default: false,
  },

  //password reset related fields
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpiry: {
    type: Date,
  },

  // registration date
  registeredOn: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model(`Doctor`, doctorSchema);
