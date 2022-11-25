//npm packages import
const crypto = require("crypto");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const fetch = require("node-fetch");

//importing utils
const {
  catchAsync,
  AppError,
  matchEncryptions,
  createSendToken,
  sendMail,
  getConfCodeEmailTemplate,
} = require("../../utils/helpers");

// importing response messages
const {
  provideEmailPassword,
  incorrectEmailPassword,
  userNotFoundID,
  userNotFoundEmail,
  tokenExpiry,
  invalidToken,
  tokenExpired,
  passwordUpdateSuccess,
  incorrectPassword,
  userRegistered,
  userNotRegistered,
  accountVerified,
  successfullyDeleted,
  userNotFound,
  profileImageRemoved,
  profileImageUpdated,
} = require("../../utils/constants/RESPONSEMESSAGES");

//importing models
const db = require("../../models");
const Patient = db.patient;

// method to sign up patient
exports.register = catchAsync(async (req, res, next) => {
  req.body.avatar = req.file.filename;

  const isThirdParty = req.body?.isThirdParty;

  const {
    email,
    password,
    role,
    name,
    phone,
    dob,
    gender,
    cnic,
    height,
    weight,
    bloodType,
    avatar,
    resetPasswordToken,
    resetPasswordExpiry,
    address,
  } = req?.body;

  // console.log(coordinates);

  const patient = new Patient({
    email,
    password: bcrypt.hashSync(password, 10),
    role,
    name,
    phone,
    dob: new Date(dob),
    gender,
    cnic,
    avatar,
    bio: {
      height,
      weight,
      bloodType,
    },
    resetPasswordToken,
    resetPasswordExpiry,
    address,
  });

  // if it is a thirdparty login such as google and facebook
  if (isThirdParty) {
    //verify the user's account by default
    patient.isVerified = true;
  } else {
    // send a verification mail to user's email
    sendMail(
      email,
      name,
      getConfCodeEmailTemplate.getVerificationEmailTemplate(
        patient._id,
        "patients"
      ),
      "Verify your account"
    );
  }

  const data = await patient.save();

  // console.log(req.body);

  res
    .status(201)
    .json({ success: true, message: `Patient ${userRegistered}`, data });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError(provideEmailPassword, 400));
  }
  const user = await Patient.findOne({ email }).select("+password");

  console.log(user);

  // Check if user exists && password is correct
  if (!user || !(await matchEncryptions(password, user.password))) {
    return next(new AppError(incorrectEmailPassword, 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

/***********************************PASSWORD RESET FUNCITONALITY ********************************************/

// method to send a verification token to the patient email (email functionality is yet to be implemented)
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // checking if there are any errors
  const errors = validationResult(req);
  if (errors.errors.length > 0) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { email } = req.body;
  const patient = await Patient.findOne({ email });
  if (!patient) {
    return next(new AppError(`patient ${userNotFoundEmail}`, 404));
  }
  // create reset token and expiry
  const resetPasswordToken = Math.floor(1000 + Math.random() * 9000).toString();
  const resetPasswordExpiry = Date.now() + 600000; // 10 mins

  // getting a custom html template for confirmation code mail
  const htmlContent =
    getConfCodeEmailTemplate.getConfirmationCodeTemplate(resetPasswordToken);
  // console.log(htmlContent);
  const subject = "Confirmation Code";

  // send email to patient
  await sendMail(email, patient.name, htmlContent, subject);

  // update patient fields and save
  patient.resetPasswordToken = resetPasswordToken;
  patient.resetPasswordExpiry = resetPasswordExpiry;
  const updatedPatient = await patient.save();

  // console.log(updatedPatient);
  res.status(200).json({
    success: true,
    resetToken: resetPasswordToken,
    message: `${tokenExpiry} 10mins`,
  });
});

// method to reset the password in case of forgetten password
exports.resetForgottenPassword = catchAsync(async (req, res, next) => {
  // checking if there are any errors
  const errors = validationResult(req);
  if (errors.errors.length > 0) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { email, resetPasswordToken, password } = req.body;
  const patient = await Patient.findOne({
    $$or: [{ email }, { resetPasswordToken }],
  });

  // checking token validity
  if (!patient) {
    return next(new AppError(invalidToken, 400));
  }
  if (patient.resetPasswordExpiry < Date.now()) {
    return next(new AppError(tokenExpired, 400));
  }

  // updating password and token fields if the token is valid
  patient.password = bcrypt.hashSync(password, 10);
  patient.resetPasswordToken = undefined;
  patient.resetPasswordExpiry = undefined;
  await patient.save();
  res.status(200).json({
    success: true,
    message: passwordUpdateSuccess,
  });
});

//reset password if the patient is logged in
exports.resetPassword = catchAsync(async (req, res, next) => {
  // checking if there are any errors
  const errors = validationResult(req);
  if (errors.errors.length > 0) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  const { email, password, newPassword } = req.body;

  const patient = await Patient.findOne({ email }).select("+password");
  if (!patient) {
    return next(new AppError(`Patient ${userNotFoundEmail}`, 404));
  }
  if (!(await matchEncryptions(password, patient.password))) {
    return next(new AppError(incorrectPassword, 400));
  }
  patient.password = bcrypt.hashSync(newPassword, 10);
  await patient.save();
  res.status(200).json({
    success: true,
    message: passwordUpdateSuccess,
  });
});

/******************************************PATIENT ACCOUNT VERIFICATION FUNCTIONALITY*******************************************/
// verify patient's account
exports.verifyPatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const patient = await Patient.findById(id);
  if (!patient) {
    return next(new AppError(`Patient ${userNotFoundID}`, 404));
  }
  patient.isVerified = true;
  await patient.save();
  res.status(200).json({
    success: true,
    message: `Patient ${accountVerified}`,
    data: {
      patient,
    },
  });
});

/********************************************THIRD PARTY AUTHENTICATION FUNCTIONALITY  ******************************************/
//method to login/singup user using google their google account
exports.googleLogin = catchAsync(async (req, res, next) => {
  // const { credentials, role, password } = req.body;

  const { credentials } = req.body;

  // console.log(jwt_decode(credentials));

  const email = jwt_decode(credentials).email;

  console.log(email);

  // socialAuth(req, res, email, role, password);
  socialAuth(req, res, next, email);
});

//method to login/singup user using google auth
exports.facebookLogin = catchAsync(async (req, res, next) => {
  // const { accessToken, userID, role, password } = req.body;
  const { accessToken, userID } = req.body;
  console.log(accessToken, userID);

  // fetching the user data from facebook graph api using the userID and accessToken
  const facebookURL = `https://graph.facebook.com/v14.0/${userID}?fields=name,email&access_token=${accessToken}`;

  const response = await fetch(facebookURL);

  const data = await response.json();

  console.log(data);

  const email = data.email;

  // socialAuth(req, res, email, role, password);
  socialAuth(req, res, next, email);
});

// social login/signup method that is common for both google and facebook endpoints
const socialAuth = catchAsync(async (req, res, next, email, role, password) => {
  const user = await Patient.findOne({ email });

  // if client is already registered with the google account we will directly log them in and send an access token to the client
  // if (user) {
  //   return createSendToken(user, 200, req, res);
  // }

  if (!user) {
    return next(new AppError(`Patient ${userNotFoundEmail}`, 404));
  }

  createSendToken(user, 200, req, res);

  // // generating a random password if no password is provided from the client
  // if (!password) {
  //   password = crypto.randomBytes(10).toString("hex");
  // }

  // // if client is not registered with the google account we will register them
  // const newUser = new User({
  //   email,
  //   role,
  //   password: bcrypt.hashSync(password, 10),
  // });

  // await newUser.save();

  // res
  //   .status(200)
  //   .json({ status: "success", message: "user registered successfully" });
});

/**************************CRUD OPERATIONS****************************/

//update the patient data
exports.updatePatient = catchAsync(async (req, res, next) => {
  id = req.decoded.id;
  data = req.body;
  // console.log(req.cookie);
  // console.log(id, data);

  // const patient = await Patient.findOne({ _id: id });
  // if (!patient) {
  //   return next(new AppError("No patient found with that email", 404));
  // }
  const updatedPatient = await Patient.findOneAndUpdate(
    { _id: id },
    { $set: data },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedPatient,
  });
});

// get the specific patient data
exports.getPatient = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const patient = await Patient.findById(id).select("+password");
  if (!patient) {
    return next(new AppError(`patient ${userNotFoundID}`, 404));
  }
  res.status(200).json({
    success: true,
    data: patient,
  });
});

// delete the patient
exports.deletePatient = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;

  const patient = await Patient.findById(id);

  if (!patient) {
    return next(new AppError(`Patient ${userNotFoundID}`, 404));
  }

  await patient.remove();

  res.status(200).json({
    success: true,
    message: `Patient ${successfullyDeleted}`,
  });
});

// update patient's profile image by deleting the old and adding the new
exports.updateProfileImage = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;

  const patient = await Patient.findById(id);

  // checking if the patient exists
  if (!patient) {
    return next(new AppError(`Patient ${userNotFound}`, 404));
  }

  // deleting the old profile image
  if (patient.avatar) {
    deleteFile(patient.avatar, "images");
  }

  // updating the profile image
  patient.avatar = req.file.filename;
  await patient.save();

  res.status(200).json({
    success: true,
    message: `Patient ${profileImageUpdated}`,
    data: {
      patient,
    },
  });
});

//remove patient's profile image
exports.removeProfileImage = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;
  const patient = await Patient.findById(id);

  // checking if the patient exists
  if (!patient) {
    return next(new AppError(`Patient ${userNotFound}`, 404));
  }

  // deleting the old profile image
  if (patient.avatar) {
    deleteFile(patient.avatar, "images");
  }

  // updating the profile image
  patient.avatar = "defaultAvatar.jpg"; //the null value will be replaced by a default image

  await patient.save();

  res.status(200).json({
    success: true,
    message: `Patient ${profileImageRemoved}`,
    data: {
      patient,
    },
  });
});
