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
    refPath: "authorType",
  },
  authorType: {
    type: String,
    enum: [ROLES.PATIENT, ROLES.DOCTOR],
    required: [true, `${requiredError} authorType`],
  },

  // comments: [
  //   {
  //     type: [mongoose.Schema.Types.ObjectId],
  //     ref: "Comment",
  //   },
  // ],
  community: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, `${requiredError} community`],
    ref: "Community",
  },
});

module.exports = mongoose.model("Post", PostSchema);
