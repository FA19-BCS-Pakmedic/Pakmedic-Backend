const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: true,
  },
  ratings: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//pre populate the doctor and patient

ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "doctor",
    select: "-__v",
  }).populate({
    path: "patient",
    select: "-__v",
  });
  next();
});

module.exports = mongoose.model("Review", ReviewSchema);
