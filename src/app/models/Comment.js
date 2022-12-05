const mongoose = require("mongoose");
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

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
    refPath: "authorType",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, `${requiredError} post`],
    ref: "Post",
  },
  authorType: {
    type: String,
    enum: Object.values(ROLES),
    required: [true, `${requiredError} authorType`],
  },
  // user_type: {
  //   type: String,
  //   enum: Object.values(ROLES),
  // },
});

module.exports = mongoose.model("Comment", CommentSchema);
