const BLOODTYPES = require("../../utils/constants/BLOODTYPES");

module.exports = (mongoose) => {
  return mongoose.Schema({
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    bloodType: {
      type: String,
      enum: Object.values(BLOODTYPES),
    },
  });
};
