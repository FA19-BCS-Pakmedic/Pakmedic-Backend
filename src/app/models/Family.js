// import npm packages
const mongoose = require("mongoose");

// import utils
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");
const RELATIONS = require("../utils/constants/RELATIONS");
// import nested schemas
const biologicalSchema = require("./NestedSchemas/BiologicalData")(mongoose);
const medicalSchema = require("./NestedSchemas/MedicalData")(mongoose);

const FamilySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, `${requiredError} name`],
  },
  relation: {
    type: String,
    required: [true, `${requiredError} relation`],
    enum: RELATIONS,
  },
  age: {
    type: Number,
    required: [true, `${requiredError} age`],
  },
  //   biological data e.g. weight, height, bloodtype
  bio: {
    type: biologicalSchema,
  },

  // medical data e.g. allergies, medications, surgeries, conditions, etc.
  medical: {
    type: medicalSchema,
  },
  appointments: [
    //this will be replaced with appointment embedded doc
  ],
  scans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
    },
  ],
  reports: [
    //this will be replaced with reports embedded doc
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  ],
});

module.exports = mongoose.model("Family", FamilySchema);
