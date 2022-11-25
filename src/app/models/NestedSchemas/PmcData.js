const { requiredError } = require("../../utils/constants/RESPONSEMESSAGES");

module.exports = (mongoose) => {
  return mongoose.Schema({
    id: {
      type: String,
      required: [true, `${requiredError} pmcID`],
    },
    qualifications: {
      //this will be replaced with the reference to another collection
      type: [
        {
          speciality: String,
          degree: String,
          university: String,
          passingYear: String,
        },
      ],
      required: [true, `${requiredError} qualifications`],
    },
    issueDate: {
      type: Date,
      required: [true, `${requiredError} issueDate`],
      default: Date.now(),
    },
    expiryDate: {
      type: Date,
      required: [true, `${requiredError} expiryDate`],
      default: Date.now(),
    },
    status: {
      type: String,
      required: [true, `${requiredError} status`],
    },
  });
};
