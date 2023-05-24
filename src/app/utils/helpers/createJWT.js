

// importing packages
const jwt = require("jsonwebtoken");
const { jwtConf } = require("../../utils/configs");

console.log(jwtConf.expiresIn);

// method to send a token along with payload to user as a response to login request
module.exports = (user, statusCode, req, res) => {
  // create token
  const token = signToken(user, jwtConf.expiresIn);

  // creating a cookie to send back to the user
  res.cookie("jwt", token, {
    // maxAge: new Date(Date.now() + jwtConf.expiresIn * 24 * 60 * 60 * 1000),
    maxAge: 30 * 24 * 60 * 60 * 1000,
    // maxAge: 10,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    message: user.status && user.status.toLowerCase().includes("warn") ? "You have received a warning, kindly be more careful in future" : "Login successful",
    token,
    user,
  });
};

// method to sign the token along with the payload
const signToken = ({ _id, email, role }, expiresIn) => {
  return jwt.sign({ id: _id, email, role }, jwtConf.accessSecret, {
    expiresIn: expiresIn
  });
};
