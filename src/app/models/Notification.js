const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    // refer to userType
    refPath: "userType",
  },
  tokenID: {
    type: String,
    required: true,
  },
  notifications: {
    type: [Object],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userType: {
    type: String,
    enum: ["Doctor", "Patient"],
  },
  data: {
    type: Object,
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
