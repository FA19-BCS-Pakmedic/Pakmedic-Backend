//npm packages import
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

//utils import
const { AppError, catchAsync } = require("../utils/helpers");
const { jwtConf } = require("../utils/configs");

const {
  userDoesNotExist,
  userNotLoggedIn,
} = require("../utils/constants/RESPONSEMESSAGES");

// import constants
const ROLES = require("../utils/constants/ROLES");

// import models
const models = require("../models");

module.exports = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError(userNotLoggedIn, 401));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, jwtConf.accessSecret);

  console.log("decoded", decoded);
  req.decoded = decoded;

  // getting the correct model based on the current user role
  let Model =
    decoded.role === ROLES[0]
      ? models.patient
      : decoded.role === ROLES[1]
      ? models.doctor
      : models.admin;
      

  // 3) Check if user still exists
  const currentUser = await Model.findById(decoded.id);

  console.log(currentUser);
  if (!currentUser) {
    return next(new AppError(userDoesNotExist, 401));
  }
  // // 4) Check if user changed password after the token was issued
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError("User recently changed password! Please log in again.", 401)
  //   );
  // }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
