const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient",
    required: [true, "Please enter a role"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
