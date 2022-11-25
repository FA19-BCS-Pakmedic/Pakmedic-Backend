// importing utils
const { duplicateCnic } = require("../utils/constants/RESPONSEMESSAGES");
const { catchAsync } = require("../utils/helpers");

//importing models
const db = require("../models");
const Patient = db.patient;

module.exports = catchAsync(async (req, res, next) => {
  const { cnic } = req.body;
  let user;
  user = await Patient.findOne({ cnic });
  if (user) {
    return next(new AppError(duplicateCnic, 400));
  }
  next();
});
