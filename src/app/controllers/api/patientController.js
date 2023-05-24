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
  stripe,
  sendNotification,
} = require("../../utils/helpers");

// importing response messages
const {
  provideEmailPassword,
  incorrectEmailPassword,
  userNotFoundID,
  userNotFoundEmail,
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
  OTPExpiry,
  optSent,
  unverified,
} = require("../../utils/constants/RESPONSEMESSAGES");

//importing models
const db = require("../../models");
const { init, getClient } = require("../../utils/helpers/voximplant");
const { stripeClient } = require("../../utils/helpers/stripe");
const Patient = db.patient;
const Doctor = db.doctor;
const Notification = db.notification;
const Appointment = db.appointment;
const Post = db.post;

// method to sign up patient
exports.register = catchAsync(async (req, res, next) => {
  // req.body.avatar = req.file.filename;

  const isThirdParty = req.body?.isThirdParty;

  let patient;
  if (isThirdParty) {
    patient = new Patient({
      ...req.body,
    });
  } else {
    patient = new Patient({
      ...req.body,
      password: bcrypt.hashSync(req.body.password, 10),
    });
  }
  console.log(req.body);

  // if it is a thirdparty login such as google and facebook
  if (isThirdParty) {
    //verify the user's account by default
    patient.isVerified = true;
  } else {
    // send a verification mail to user's email
    sendMail(
      patient?.email,
      patient?.name,
      getConfCodeEmailTemplate.getVerificationEmailTemplate(
        patient._id,
        "patients"
      ),
      "Verify your account"
    );
  }

  const customer = await stripeClient.customers.create({
    name: patient.name,
    email: patient.email,
  });

  patient.stripeCustomerId = customer.id;

  const user = await patient.save();

  const data = {
    userName: `${user._id.toString()}`,
    userDisplayName: user.name,
    userPassword: user._id.toString(),
    userActive: true,
    applicationId: "10470602", //TODO: Replace this with variable from .env
  };

  await init();
  const client = getClient();

  console.log(client);
  console.log(await client.Users.addUser(data));

  //  3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, isThirdParty, status } = req.body;

  const user = await Patient.findOne({ email }).select("+password");

  if (!user || (!isThirdParty && !password)) {
    return next(new AppError(incorrectEmailPassword, 401));
  } else if (!user?.isThirdParty) {
    // Check if user exists && password is correct
    if (!(await matchEncryptions(password, user.password))) {
      return next(new AppError(incorrectEmailPassword, 401));
    }
  } else if (user.isThirdParty && !user.isVerified) {
    return next(new AppError(unverified, 401));
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
    message: `${optSent}. ${OTPExpiry} 10mins`,
  });
});

//method to verify the otp code sent to the email
exports.verifyOTP = catchAsync(async (req, res, next) => {
  //get email and otp from req query param
  const { email, otp } = req.query;

  const patient = await Patient.findOne({ email });
  //if patient with email does not exist

  console.log(patient);

  if (!patient) {
    return next(new AppError(`patient ${userNotFoundEmail}`, 404));
  }

  //if the otp code is incorrect
  if (patient.resetPasswordToken !== otp) {
    return next(new AppError(invalidToken, 400));
  }

  //if the otp code has been expired
  if (patient.resetPasswordExpiry < Date.now()) {
    return next(new AppError(tokenExpired, 400));
  }

  res.status(200).json({
    success: true,
    message: "OTP verified",
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

  console.log(req.body);
  const patient = await Patient.findOne({
    email: email,
  });

  console.log(patient);

  // checking token validity
  if (!patient) {
    return next(new AppError(`Patient ${userNotFoundEmail}`, 400));
  }
  if (patient.resetPasswordToken !== resetPasswordToken) {
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

//get patient object if he is logged in
exports.getPatient = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new AppError(`Patient ${userNotFoundEmail}`, 404));
  }
  res.status(200).json({
    success: true,
    message: user.status.toLowerCase().includes("warn") ? "You have received a warning, kindly be more careful in future" : "Login successful",
    data: {
      user,
    },
  });
});

exports.getPatients = catchAsync(async (req, res, next) => {
  const patients = await Patient.find();

  res.status(200).json({
    success: true,
    data: {
      patients,
    },
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
  id = req.user._id;
  data = req.body;

  console.log(req.body);
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
    data: { user: updatedPatient },
  });
});

// get the specific patient data
exports.getPatientById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  console.log(id);

  const patient = await Patient.findById(id);
  if (!patient) {
    return next(new AppError(`patient ${userNotFoundID}`, 404));
  }

  console.log("PATIENT BY ID", patient);

  res.status(200).json({
    success: true,
    data: {
      user: patient,
    },
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

exports.addAvatar = catchAsync(async (req, res, next) => {
  const id = req.user._id;

  const patient = await Patient.findById(id);

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

exports.handleEhrRequest = catchAsync(async(req, res, next) => {
 
    const {doctorId, status} = req.body;

    const patientId = req.user._id;

    const doctor = await Doctor.findById(doctorId);

    const notification = await Notification.findOne({user: doctorId});

    let title = '';
    let body = '';

  
    
    if(status.toLowerCase() === 'accept') {
      if(doctor.accessList.includes(patientId)) {
        return next(new AppError('Access already provided', 400));
      }
      doctor.accessList.push(patientId);
      title="Ehr access request accepted";
      body = `Your request for ehr access has been accepted by ${req.user.name}`;
    } else if(status.toLowerCase() === 'reject' || status.toLowerCase() === 'revoke') {
      doctor.accessList = doctor.accessList.filter((patient) => patient._id.toString() !== patientId.toString());
      title = `Ehr access request ${status}ed`;
      body = `Your request for ehr access has been ${status}ed by ${req.user.name}`;
    }

    if(notification){
      await sendNotification(
        title, body, doctorId, 'AssistantScreen', "test", null, notification.tokenID
      );
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Request handled successfully'
    });

});

exports.getPatientDashboardData = catchAsync(async(req, res) => {

  const {id} = req.params;

  const appointments = await Appointment.find({patient: id, status: 'upcoming'});

  //only select the field speciality from the doctor model
  let topSpecialities = await Doctor.aggregate([
    { $project: { speciality: 1 } },
    { $group: { _id: '$speciality', count: { $sum: 1 } } },
    { $limit: 5 },
  ]);


  topSpecialities = topSpecialities.map((speciality) => {
    return speciality._id;
  });

  const doctorQueryResult = await Doctor.aggregate([
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'doctor', as: 'reviews' } },
    { $addFields: { avgRating: { $avg: '$reviews.ratings' }, reviewCount: { $size: '$reviews' } } },
    { $sort: { avgRating: -1, reviewCount: -1 } },
    { $limit: 5 }
  ]);

  console.log(doctorQueryResult);

  const latestPost = await Post.find().sort({date: -1}).limit(1);

  console.log(latestPost, "LATEST POST");

  res.status(200).json({
    success: true,
    data: {
      appointments,
      topDoctors: doctorQueryResult,
      latestPost,
      topSpecialities,
    }
  });

});