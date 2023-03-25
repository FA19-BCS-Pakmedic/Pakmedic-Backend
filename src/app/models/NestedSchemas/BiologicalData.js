const BLOODTYPES = require("../../utils/constants/BLOODTYPES");

module.exports = (mongoose) => {
  return mongoose.Schema({
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    bloodGroup: {
      type: String,
      enum: Object.values(BLOODTYPES),
    },
  });
};
