//npm packages import
const crypto = require("crypto");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const fetch = require("node-fetch");

// importing utils
const {
  AppError,
  catchAsync,
  createSendToken,
  matchEncryptions,
  sendMail,
  getConfCodeEmailTemplate,
  deleteFile,
} = require("../../utils/helpers");
const { pmcConf } = require("../../utils/configs");
const {
  invalidPmcID,
  userRegistered,
  provideEmailPassword,
  incorrectEmailPassword,
  passwordUpdateSuccess,
  tokenExpired,
  invalidToken,
  treatmentAdded,
  treatmentDeleted,
  userNotFound,
  eSignAdded,
  eSignDeleted,
  eSignUpdated,
  successfullyAdded,
  successfullyDeleted,
  successfullyUpdated,
  accountVerified,
  profileImageUpdated,
  noDoctorsInHospital,
  profileImageRemoved,
  optSent,
  OTPExpiry,
  unverified,
} = require("../../utils/constants/RESPONSEMESSAGES");

//importing models
const db = require("../../models");
const Doctor = db.doctor;

// method to verify the doctor PMC id and return pmc data to the client
exports.verifyDoctorPMC = catchAsync(async (req, res, next) => {
  const { pmcId } = req.body;

  console.log(req.body);

  if (!pmcId) {
    return next(new AppError(invalidPmcID, 400));
  }
  const sendData = {
    RegistrationNo: pmcId,
  };

  //   making a post request to the pmc backend to fetch the doctor data
  const response = await fetch(pmcConf.pmcEndPoint, {
    method: "POST",
    body: JSON.stringify(sendData),
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();

  if (data.status == true) {
    return res.status(200).json({
      status: "success",
      data: data.data,
      message: data.message,
    });
  } else {
    return next(new AppError(data.message, 400));
  }
});

// method to register the doctor
exports.register = catchAsync(async (req, res, next) => {
  ({
    email,
    password,
    role,
    name,
    phone,
    dob,
    gender,
    location,
    avatar,
    pmcId,
    qualifications,
    issueDate,
    expiryDate,
    status,
    speciality,
    isThirdParty,
  } = req.body);

  let doctor;

  doctor = new Doctor({
    email,
    password: isThirdParty ? "" : bcrypt.hashSync(password, 10),
    role,
    name,
    phone,
    gender,
    location,
    pmc: {
      id: pmcId,
      qualifications,
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      status,
    },
    speciality,
    isThirdParty: isThirdParty ? isThirdParty : false,
  });

  // if it is a thirdparty login such as google and facebook
  if (isThirdParty) {
    //verify the user's account by default
    doctor.isVerified = true;
  } else {
    // send a verification mail to user's email
    sendMail(
      email,
      name,
      getConfCodeEmailTemplate.getVerificationEmailTemplate(
        doctor._id,
        "doctors"
      ),
      "Verify your account"
    );
  }

  const user = await doctor.save();

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

// method to login the doctor
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, isThirdParty } = req.body;

  // if (!email || !password) {
  //   return next(new AppError(provideEmailPassword, 400));
  // }

  const user = await Doctor.findOne({ email }).select("+password");

  if (!user || (!isThirdParty && !password)) {
    return next(new AppError(incorrectEmailPassword, 401));
  } else if (!user?.isThirdParty) {
    // Check if user exists && password is correct
    if (!(await matchEncryptions(password, user.password))) {
      return next(new AppError(incorrectEmailPassword, 401));
    }
  } else if (isThirdParty && !user.isVerified) {
    return next(new AppError(unverified, 401));
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

// get doctor if he is logged in
exports.getDoctor = catchAsync(async (req, res, next) => {
  const user = req.user;

  console.log("GET DOCTOR METHOD: ", user);

  if (!user) {
    return next(new AppError(`Doctor ${userNotFoundEmail}`, 404));
  }
  res.status(200).json({
    success: true,
    message: "Doctor found",
    data: {
      user,
    },
  });
});

//method to check whether is already registered and return the

/***********************************PASSWORD RESET FUNCITONALITY ********************************************/

// method to send a verification token to the doctor email (email functionality is yet to be implemented)
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // checking if there are any errors
  const errors = validationResult(req);
  if (errors.errors.length > 0) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { email } = req.body;
  const doctor = await Doctor.findOne({ email });
  if (!doctor) {
    return next(new AppError(`doctor ${userNotFoundEmail}`, 404));
  }
  // create reset token and expiry
  const resetPasswordToken = Math.floor(1000 + Math.random() * 9000).toString();
  const resetPasswordExpiry = Date.now() + 600000; // 10 mins

  // getting a custom html template for confirmation code mail
  const htmlContent =
    getConfCodeEmailTemplate.getConfirmationCodeTemplate(resetPasswordToken);
  // console.log(htmlContent);
  const subject = "Confirmation Code";

  // send email to doctor
  await sendMail(email, doctor.name, htmlContent, subject);

  // update doctor fields and save
  doctor.resetPasswordToken = resetPasswordToken;
  doctor.resetPasswordExpiry = resetPasswordExpiry;

  await doctor.save();

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

  console.log(email, otp);
  const doctor = await Doctor.findOne({ email });
  //if doctor with email does not exist
  if (!doctor) {
    return next(new AppError(`doctor ${userNotFoundEmail}`, 404));
  }

  //if the otp code is incorrect
  if (doctor.resetPasswordToken !== otp) {
    return next(new AppError(invalidToken, 400));
  }

  //if the otp code has been expired
  if (doctor.resetPasswordExpiry < Date.now()) {
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
  const doctor = await Doctor.findOne({
    $and: [{ email }, { resetPasswordToken }],
  });

  // checking token validity
  if (!doctor) {
    return next(new AppError(invalidToken, 400));
  }
  if (doctor.resetPasswordExpiry < Date.now()) {
    return next(new AppError(tokenExpired, 400));
  }

  // updating password and token fields if the token is valid
  doctor.password = bcrypt.hashSync(password, 10);
  doctor.resetPasswordToken = undefined;
  doctor.resetPasswordExpiry = undefined;
  await doctor.save();
  res.status(200).json({
    success: true,
    message: passwordUpdateSuccess,
  });
});

//reset password if the doctor is logged in
exports.resetPassword = catchAsync(async (req, res, next) => {
  // checking if there are any errors
  const errors = validationResult(req);
  if (errors.errors.length > 0) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  const { email, password, newPassword } = req.body;

  const doctor = await Doctor.findOne({ email }).select("+password");
  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFoundEmail}`, 404));
  }
  if (!(await matchEncryptions(password, doctor.password))) {
    return next(new AppError(incorrectPassword, 400));
  }
  doctor.password = bcrypt.hashSync(newPassword, 10);
  await doctor.save();
  res.status(200).json({
    success: true,
    message: passwordUpdateSuccess,
  });
});

/******************************************DOCTOR ACCOUNT VERIFICATION FUNCTIONALITY*******************************************/
// verify doctors's account
exports.verifyDoctor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }
  doctor.isVerified = true;
  await doctor.save();
  res.status(200).json({
    success: true,
    message: `Doctor ${accountVerified}`,
    data: {
      doctor,
    },
  });
});

/********************************************THIRD PARTY AUTHENTICATION FUNCTIONALITY  ******************************************/
// //method to login/singup user using google their google account
// exports.googleLogin = catchAsync(async (req, res, next) => {
//   // const { credentials, role, password } = req.body;

//   const { credentials } = req.body;

//   // console.log(jwt_decode(credentials));

//   const email = jwt_decode(credentials).email;

//   console.log(email);

//   // socialAuth(req, res, email, role, password);
//   socialAuth(req, res, next, email);
// });

// //method to login/singup user using google auth
// exports.facebookLogin = catchAsync(async (req, res, next) => {
//   // const { accessToken, userID, role, password } = req.body;
//   const { accessToken, userID } = req.body;
//   console.log(accessToken, userID);

//   // fetching the user data from facebook graph api using the userID and accessToken
//   const facebookURL = `https://graph.facebook.com/v14.0/${userID}?fields=name,email&access_token=${accessToken}`;

//   const response = await fetch(facebookURL);

//   const data = await response.json();

//   console.log(data);

//   const email = data.email;

//   // socialAuth(req, res, email, role, password);
//   socialAuth(req, res, next, email);
// });

// // social login/signup method that is common for both google and facebook endpoints
// const socialAuth = catchAsync(async (req, res, next, email, role, password) => {
//   const user = await Doctor.findOne({ email });

//   // if client is already registered with the google account we will directly log them in and send an access token to the client
//   // if (user) {
//   //   return createSendToken(user, 200, req, res);
//   // }

//   if (!user) {
//     return next(new AppError(`Doctor ${userNotFoundEmail}`, 404));
//   }

//   createSendToken(user, 200, req, res);

//   // // generating a random password if no password is provided from the client
//   // if (!password) {
//   //   password = crypto.randomBytes(10).toString("hex");
//   // }

//   // // if client is not registered with the google account we will register them
//   // const newUser = new User({
//   //   email,
//   //   role,
//   //   password: bcrypt.hashSync(password, 10),
//   // });

//   // await newUser.save();

//   // res
//   //   .status(200)
//   //   .json({ status: "success", message: "user registered successfully" });
// });

// 3rd party auth method
// const socialAuth = catchAsync(async (req, res, next) => {
//   console.log("email", req.email);
// });

/***************************DOCTOR UPDATION AND DELETION OPERATIONS**********************************/
// method to update doctor details
exports.updateDoctor = catchAsync(async (req, res, next) => {
  const id = req.user._id;

  const data = req.body;

  // updating the doctor details
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { $set: data },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  res.status(200).json({
    success: true,
    message: `Docter ${successfullyUpdated}`,
    data: {
      user: doctor,
    },
  });
});

// method to delete the doctor account along with all the embedded documents and related images
exports.deleteDoctor = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;

  // checking if the doctor exists
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  // deleting the profile image of doctor
  if (doctor.avatar) {
    deleteFile(doctor.avatar, "images");
  }

  // deleting the doctor account
  await Doctor.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: `Doctor ${successfullyDeleted}`,
  });
});

//search doctor by name, location, speciality, treatments, email
exports.findDoctors = catchAsync(async (req, res, next) => {
  const { keyword } = req.body;
  const doctors = await Doctor.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { location: { $regex: keyword, $options: "i" } },
      { speciality: { $regex: keyword, $options: "i" } },
      { treatments: { $regex: keyword, $options: "i" } },
    ],
  });

  if (!doctors.length > 0) {
    return next(new AppError(`Doctors ${userNotFound}`, 404));
  }

  res.status(200).json({
    success: true,
    // message: `Doctor ${successfullyFetched}`,
    data: {
      doctors,
    },
  });
});

//get doctor by email and if the doctor is found then return the doctor data along with the token
// exports.getDoctorByEmail = catchAsync(async (req, res, next) => {
//   const { email } = req.body;

//   const doctor = await Doctor.findOne({ email });

//   if (!doctor) {
//     return next(new AppError(`Doctor ${userNotFound}`, 404));
//   }

//   createSendToken(doctor, 200, req, res);
// });

// { email }

// update doctor's profile image by deleting the old and adding the new
exports.updateProfileImage = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;

  const doctor = await Doctor.findById(id);

  // checking if the doctor exists
  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  // deleting the old profile image
  if (doctor.avatar) {
    deleteFile(doctor.avatar, "images");
  }

  // updating the profile image
  doctor.avatar = req.file.filename;
  await doctor.save();

  res.status(200).json({
    success: true,
    message: `Doctor ${profileImageUpdated}`,
    data: {
      doctor,
    },
  });
});

//remove doctor's profile image
exports.removeProfileImage = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;
  const doctor = await Doctor.findById(id);

  // checking if the doctor exists
  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  // deleting the old profile image
  if (doctor.avatar) {
    deleteFile(doctor.avatar, "images");
  }

  // updating the profile image
  doctor.avatar = "defaultAvatar.jpg"; //the null value will be replaced by a default image

  await doctor.save();

  res.status(200).json({
    success: true,
    message: `Doctor ${profileImageRemoved}`,
    data: {
      doctor,
    },
  });
});

//method to fetch the doctor by id
exports.findDoctorById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const doctor = await Doctor.findById(id)
    .populate({
      path: "services",
      model: "Service",
      populate: {
        path: "hospital",
        model: "Hospital",
        populate: { path: "address", model: "Address" },
      },
    })
    .populate({
      path: "experiences",
      model: "Experience",
      populate: {
        path: "hospital",
        model: "Hospital",
        populate: { path: "address", model: "Address" },
      },
    });

  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  res.status(200).json({
    success: true,
    data: {
      doctor,
    },
  });
});

// search by hospital
exports.findDoctorsByHospital = catchAsync(async (req, res, next) => {
  const findHospital = req.body?.hospital;

  // fetch all doctors
  let filteredDoctors = await Doctor.find().populate({
    path: "services",
    model: "Service",
    populate: {
      path: "hospital",
      model: "Hospital",
      match: { name: { $regex: findHospital, $options: "i" } },
    },
  });

  console.log(filteredDoctors);

  filteredDoctors = filteredDoctors.filter((doctor) => {
    const isHospitalWorker = doctor.services.some((service) => {
      return service.hospital?.name;
      // console.log(service);
    });

    if (isHospitalWorker) {
      return doctor;
    }
  });
  if (!filteredDoctors.length > 0) {
    return next(new AppError(noDoctorsInHospital, 404));
  }

  console.log(filteredDoctors);

  res.status(200).json({
    success: true,
    data: {
      filteredDoctors,
    },
  });
});

/*****************************************TREATMENTS FUNCTIONS****************************/

//add a treatment
exports.addTreatment = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const { treatment } = req.body;

  console.log("TREATMENT", treatment);

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  // push the treatement inside the array only if it is unique
  if (!doctor.treatments.includes(treatment)) {
    doctor.treatments.push(treatment);
  }
  await doctor.save();

  res.status(200).json({
    success: true,
    message: `Treatment ${successfullyAdded}`,
    data: {
      user: doctor,
    },
  });
});

//delete a treatement
exports.removeTreatment = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;
  const { treatment } = req.body;

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  doctor.treatments.pull(treatment);
  await doctor.save();

  res.status(200).json({
    success: true,
    message: `Treatment ${successfullyDeleted}`,
    data: {
      doctor,
    },
  });
});

// find a doctor based on treatment name
exports.findDoctorByTreatment = catchAsync(async (req, res, next) => {
  const { treatment } = req.body;

  const doctors = await Doctor.find({ treatments: treatment });

  if (!doctors) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  res.status(200).json({
    success: true,
    results: doctors.length,
    data: {
      doctors,
    },
  });
});

/*****************************************E-SIGN FUNCTIONS****************************/
// add esign file and add the file path to the doctor's document
exports.addESign = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;
  const eSign = req.file.filename;

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    deleteFile(req.file.filename, "images");
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  // add the eSign value to the eSign field
  doctor.eSign = eSign;

  await doctor.save();

  res.status(200).json({
    success: true,
    message: `E-Signature ${successfullyAdded}`,
    data: {
      doctor,
    },
  });
});

// remove esign file and remove the file path from the doctor's document
exports.removeESign = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  // delete the e-sign file from the images folder
  deleteFile(doctor.eSign, "images");

  // remove the eSign value from the eSign field
  doctor.eSign = "";
  await doctor.save();

  res.status(200).json({
    success: true,
    // message: eSignDeleted,
    message: `Treatment ${successfullyDeleted}`,
    data: {
      doctor,
    },
  });
});

// get esign file from the doctor's document
exports.getESign = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  const eSign = doctor.eSign;

  res.status(200).json({
    success: true,
    data: {
      eSign,
    },
  });
});

// update esign in doctor's document
exports.updateESign = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;
  const eSign = req.file.filename;

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    deleteFile(req.file.filename, "images");
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  // delete the old eSign file from the images folder
  deleteFile(doctor.eSign, "images");

  // add the new eSign value to the eSign field
  doctor.eSign = eSign;
  await doctor.save();

  res.status(200).json({
    success: true,
    // message: eSignUpdated,
    message: `E-Signature ${successfullyUpdated}`,
    data: {
      doctor,
    },
  });
});

/****************************ABOUT ME OPERATIONS***********************/
// add about
exports.addUpdateAbout = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;
  const { about } = req.body;

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  doctor.about = about;
  await doctor.save();

  res.status(200).json({
    success: true,
    message: `About ${successfullyAdded}`,
    data: {
      doctor,
    },
  });
});

// remove About
exports.removeAbout = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  doctor.about = "";
  await doctor.save();

  res.status(200).json({
    success: true,
    message: `About ${successfullyDeleted}`,
    data: {
      doctor,
    },
  });
});
