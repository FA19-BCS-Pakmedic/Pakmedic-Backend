const mongoose = require("mongoose");

const reminderSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter an email"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dosageForm: {
    type: String,
    enum: ["tablet", "syrup", "capsule", "syringe"],
    required: [true, "Please select a dosage form"],
  },
  dosageAmount: {
    type: Number,
    required: [true, "Please enter a dosage amount as Integer in mgs"],
  },
  duration: {
    type: Number,
    required: [true, "Please enter a dosage duration in days as Integer"],
  },
  startDate: {
    type: String,
    required: [true, "Please enter a start date"],
  },
  endDate: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;
