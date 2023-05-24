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
    refPath: "authorType",
    required: true,
  },
  authorType: {
    type: String,
    enum: Object.values(ROLES),
  },
  file: {
    type: String,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  community: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, `${requiredError} community`],
    ref: "Community",
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
});

// pre query to populate the author, and community
PostSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
    select: "-__v",
  })
  .populate({
    path: "community",
    select: "-__v",
  })
  .populate({
    path: "comments",
    select: "-__v",
  });
  next();
});

module.exports = mongoose.model("Post", PostSchema);
