module.exports = (mongoose) => {
  return mongoose.Schema({
    allergies: {
      type: [String],
      default: [],
    },
    geneticDiseases: {
      type: [String],
      default: [],
    },
  });
};
