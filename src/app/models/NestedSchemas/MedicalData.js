module.exports = (mongoose) => {
  return mongoose.Schema({
    allergies: {
      type: [String],
    },
    surgeries: {
      type: [String],
    },
    geneticDiseases: {
      type: [String],
    },
  });
};
