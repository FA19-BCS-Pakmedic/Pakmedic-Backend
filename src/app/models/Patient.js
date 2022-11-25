const mongoose = require("mongoose");

const ROLES = require("../utils/constants/ROLES");
const GENDERS = require("../utils/constants/GENDERS");
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

// nested schemas import
const biologicalSchema = require("./NestedSchemas/BiologicalData")(mongoose);
const medicalSchema = require("./NestedSchemas/MedicalData")(mongoose);

// const biologicalSchema = mongoose.Schema({
//   height: {
//     type: Number,
//   },
//   weight: {
//     type: Number,
//   },
//   bloodType: {
//     type: String,
//     enum: Object.values(BLOODTYPES),
//   },
// });

// const medicalSchema = mongoose.Schema({
//   allergies: {
//     type: [String],
//   },
//   surgeries: {
//     type: [String],
//   },
//   geneticDiseases: {
//     type: [String],
//   },
// });

const patientSchema = mongoose.Schema({
  //authentication data
  email: {
    type: String,
    required: [true, `${requiredError}an email`],
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

  // general data
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
  cnic: {
    type: String,
    required: [true, `${requiredError} cnic`],
  },
  address: {
    // replace with address reference
    // type: String,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: [true, `${requiredError} address`],
    // required: [true, `${requiredError} address`],
  },
  avatar: {
    type: String,
  },

  //   biological data e.g. weight, height, bloodtype
  bio: {
    type: biologicalSchema,
  },

  // medical data e.g. allergies, medications, surgeries, conditions, etc.
  medical: {
    type: medicalSchema,
  },

  //   patient specific data
  communities: {
    //replace with community refernce
    type: [String],
  },
  reminders: {
    //replace with reminder reference
    type: [String],
  },
  familyMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
    },
  ],

  // patient EHRs
  scans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
    },
  ],
  prescriptions: {
    //replace with prescriptions refernce
    type: [String],
  },
  reports: [
    //replace with reports refernce
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  ],

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

module.exports = mongoose.model(`Patient`, patientSchema);
