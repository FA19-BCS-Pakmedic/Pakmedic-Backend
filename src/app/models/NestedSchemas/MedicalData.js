module.exports = (mongoose) => {
  return mongoose.Schema({
    allergies: {
      type: [String],
    },
    geneticDiseases: {
      type: [String],
    },
  });
};
