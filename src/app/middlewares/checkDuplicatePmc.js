// importing utils
const { duplicatePmcID } = require("../utils/constants/RESPONSEMESSAGES");
const { catchAsync, AppError } = require("../utils/helpers");

//importing models
const db = require("../models");
const Doctor = db.doctor;

module.exports = catchAsync(async (req, res, next) => {
  const { pmcID } = req.body;
  let user;
  user = await Doctor.findOne().where("pmc.id").equals(pmcID);
  if (user) {
    return next(new AppError(duplicatePmcID, 400));
  }
  next();
});
