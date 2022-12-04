const mongoose = require("mongoose");

const ROLES = require("../utils/constants/ROLES");

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, `${requiredError} content`],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, `${requiredError} author`],
    ref: "user_type",
  },
  user_type: {
    type: String,
    enum: Object.values(ROLES),
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
