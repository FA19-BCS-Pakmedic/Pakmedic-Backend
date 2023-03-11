// importing npm packages
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const fetch = require("node-fetch");

//importing utils
const { catchAsync, AppError } = require("../../utils/helpers");
const { jwtConf } = require("../../utils/configs");

// importing models
const db = require("../../models");
const User = db.user;

// signing up user
exports.signup = catchAsync(async (req, res, next) => {
  // checking if there are any errors
  const errors = validationResult(req);
  // console.log(errors.errors);
  if (errors.errors.length > 0) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  //proceeding to store the data in database.
  const { email, password, role } = req.body;
  const user = new User({
    email,
    password: bcrypt.hashSync(password, 10),
    role,
  });
  data = await user.save();
  // console.log(data);
  res
    .status(200)
    .json({ status: "success", message: "user registered successfully" });
});

// method to log user in
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // console.table(req.body);

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  // Check if user exists && password is correct
  if (!user || !(await matchPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

//method to login/singup user using google their google account
exports.googleLogin = catchAsync(async (req, res) => {
  const { credentials, role, password } = req.body;

  const email = jwt_decode(credentials).email;

  socialAuth(req, res, email, role, password);
});

//method to login/singup user using google auth
exports.facebookLogin = catchAsync(async (req, res) => {
  const { accessToken, userID, role, password } = req.body;
  console.log(accessToken, userID);

  // fetching the user data from facebook graph api using the userID and accessToken
  const facebookURL = `https://graph.facebook.com/v2.11/${userID}?fields=name,email&access_token=${accessToken}`;

  const response = await fetch(facebookURL);

  const data = await response.json();

  const email = data.email;

  socialAuth(req, res, email, role, password);
});

// social login/signup method that is common for both google and facebook endpoints
const socialAuth = catchAsync(async (req, res, email, role, password) => {
  const user = await User.findOne({ email });

  // if client is already registered with the google account we will directly log them in and send an access token to the client
  if (user) {
    return createSendToken(user, 200, req, res);
  }

  // generating a random password if no password is provided from the client
  if (!password) {
    password = crypto.randomBytes(10).toString("hex");
  }

  // if client is not registered with the google account we will register them
  const newUser = new User({
    email,
    role,
    password: bcrypt.hashSync(password, 10),
  });

  await newUser.save();

  res
    .status(200)
    .json({ status: "success", message: "user registered successfully" });
});

// method to send a token along with payload to user as a response to login request
const createSendToken = (user, statusCode, req, res) => {
  // create token
  const token = signToken(user.email, user.role);

  // creating a cookie to send back to the user
  res.cookie("jwt", token, {
    // maxAge: new Date(Date.now() + jwtConfig.expiresIn * 24 * 60 * 60 * 1000),
    maxAge: 2 * 60 * 60 * 1000,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// method to sign the token along with the payload
const signToken = ({ email, role }) => {
  return jwt.sign({ email, role }, jwtConf.accesSecret, {
    expiresIn: "30s",
  });
};

// method to match passwords
const matchPassword = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};
