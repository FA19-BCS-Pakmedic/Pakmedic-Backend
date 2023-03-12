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
    ref: "Post",
  },
  authorType: {
    type: String,
    enum: Object.values(ROLES),
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

// pre find query population for author and replies
CommentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
    select: "name",
  }).populate({
    path: "replies",
    select: "content date author",
  });
  next();
});

module.exports = mongoose.model("Comment", CommentSchema);
