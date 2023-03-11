// model import
const db = require("../models");

// utils import
const { AppError, catchAsync, deleteFile } = require("../utils/helpers");
const ROLES = require("../utils/constants/ROLES");
const {
  duplicateDoctor,
  invalidRole,
} = require("../utils/constants/RESPONSEMESSAGES");

// function to check if there are users with the same email or pmc id
module.exports = catchAsync(async (req, res, next) => {
  const { email, pmcId } = req.body;
  // const { id } = pmc;
  let user;

  // if (role === Object.values(ROLES)[1]) {
  const Doctor = db.doctor;
  user = await Doctor.findOne().or([{ email }, { "pmc.id": pmcId }]);

  console.log(user);
  if (user) {
    return next(new AppError(duplicateDoctor, 409));
  }

  next();
});
