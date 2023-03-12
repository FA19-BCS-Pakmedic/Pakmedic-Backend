const mongoose = require("mongoose");
const ROLES = require("../utils/constants/ROLES");
const User = require("./User");

const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userType",
    required: [true, `${requiredError} sender`],
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userType",
    required: [true, `${requiredError} receiver`],
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  roomID: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  userType: {
    type: String,
    enum: Object.values(ROLES),
  },
});



module.exports = mongoose.model("Message", messageSchema);
