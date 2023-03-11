const mongoose = require("mongoose");
const { requiredError } = require("../utils/constants/RESPONSEMESSAGES");

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `${requiredError} community name`],
  },
  tags: {
    type: [String],
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  totalMember: {
    type: Number,
    default: 0,
  },
  // posts: {
  //   type: [mongoose.Schema.Types.ObjectId],
  //   ref: "Post",
  // },
});

module.exports = mongoose.model("Community", CommunitySchema);
