const mongoose = require("mongoose");
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");
const ROLES = require("../utils/constants/ROLES");

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, `${requiredError} content`],
  },
  title: {
    type: String,
    required: [true, `${requiredError} title`],
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
  comments: [
    {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("Post", PostSchema);
