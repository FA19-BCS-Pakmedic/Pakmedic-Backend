// importing utils
const { duplicateEmail } = require("../utils/constants/RESPONSEMESSAGES");
const { catchAsync } = require("../utils/helpers");

//importing models
const db = require("../models");
const Doctor = db.doctor;
const Patient = db.patient;

module.exports = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  let user;
  user = await Doctor.findOne({ email });
  user = await Patient.findOne({ email });
  if (user) {
    return next(new AppError(duplicateEmail, 400));
  }
  next();
});
