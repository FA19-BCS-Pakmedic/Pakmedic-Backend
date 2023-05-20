const mongoose = require("mongoose");
const { create } = require("./User");

const MedicineSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage_form: {
    type: String,
    required: true,
  },
  dosage_frequency: {
    type: String,
    required: true,
  },
  dosage_size: {
    type: Number,
    //required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  additional_days: {
    type: Number,
    default: 0,
  },
  precautionary_details: {
    type: String,
    required: true,
  },
});

const PrescriptionSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  medicines: [
    {
      type: MedicineSchema,
      required: true,
    },
  ],
  file: {
    type: String,
    default: "default.png",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// pre find populate
PrescriptionSchema.pre(/^find/, function (next) {
  this.populate({
    path: "patient",
    select: "-__v",
  }).populate({
    path: "doctor",
    select: "-__v",
  });
  next();
});

module.exports = mongoose.model("Prescription", PrescriptionSchema);
