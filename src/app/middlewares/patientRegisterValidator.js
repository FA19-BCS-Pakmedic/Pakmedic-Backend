const { check, body, validationResult } = require("express-validator");

const { catchAsync, deleteFile, AppError } = require("../utils/helpers");
const {
  passwordRegex,
  cnicRegex,
  stringRegex,
  phoneRegex,
  dateOfBirthRegex,
} = require("../utils/constants/REGEX");

const {
  invalidEmail,
  invalidPassword,
  invalidCnic,
  invalidStringRegex,
  invalidPhoneNo,
  invalidDOB,
} = require("../utils/constants/RESPONSEMESSAGES");

// function to validate the patient information for registration
module.exports = catchAsync(async (req, res, next) => {
  // console.log("This middle ware is running");
  //   console.log(body("email").isEmail());
  await body("email").isEmail().withMessage(invalidEmail).run(req);
  console.log(validationResult(req));
  await body("password")
    .matches(passwordRegex)
    .withMessage(invalidPassword)
    .run(req);
  await body("cnic").matches(cnicRegex).withMessage(invalidCnic).run(req);
  await body("name")
    .matches(stringRegex)
    .withMessage(invalidStringRegex)
    .run(req);
  await body("phone").matches(phoneRegex).withMessage(invalidPhoneNo).run(req);
  await body("dob").matches(dateOfBirthRegex).withMessage(invalidDOB).run(req);

  // checking if there are any errors
  const errors = validationResult(req);
  console.log(errors);
  if (errors.errors.length > 0) {
    deleteFile(req.file.filename, "images");
    return next(new AppError(errors.array()[0].msg, 400));
  }

  next();
});
