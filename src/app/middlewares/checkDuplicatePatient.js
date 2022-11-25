const db = require("../models");
const { AppError, catchAsync, deleteFile } = require("../utils/helpers");

const ROLES = require("../utils/constants/ROLES");
const {
  duplicatePatient,
  invalidRole,
} = require("../utils/constants/RESPONSEMESSAGES");

// function to check if there are users with the same email or cnic
module.exports = catchAsync(async (req, res, next) => {
  const { email, cnic, role } = req.body;
  let user;

  if (role === Object.values(ROLES)[0]) {
    const Patient = db.patient;
    user = await Patient.findOne({ $or: [{ email }, { cnic }] });
    if (user) {
      deleteFile(req.file.filename, "images");
      return next(new AppError(duplicatePatient, 409));
    }
  } else {
    return next(new AppError(invalidRole, 404));
  }

  next();
});
