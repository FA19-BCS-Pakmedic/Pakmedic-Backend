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
    // required: [!this.isThirdParty, `${requiredError} password`],
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
  // dob: {
  //   type: Date,
  //   // required: [true, `${requiredError} date of birth`],
  // },
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
    // required: [true, `${requiredError} avatar`],
    default: "default.png",
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
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  //account verification
  isVerified: {
    type: Boolean,
    default: false,
  },

  //third party authentication
  isThirdParty: {
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

  status: {
    type: String,
    enum: ["Active", "Banned", "Warned", "Inactive", "active", "banned", "warned", "inactive"],
    default: "active",
  },

  joined: {
    type: Date,
    default: Date.now(),
  },
  accessList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
  ],
});

// pre function to prepopulate before find query
doctorSchema.pre(/^find/, function (next) {
  this.populate({
    path: "experiences",
    select: "-__v",
  })
    .populate({
      path: "services",
      select: "-__v",
    })
    .populate({
      path: "communities",
      select: "-__v",
    })
    .populate({
      path: "accessList",
      select: "-__v",
    });
  next();
});

module.exports = mongoose.model(`Doctor`, doctorSchema);
