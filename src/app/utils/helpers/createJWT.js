// importing packages
const jwt = require("jsonwebtoken");
const { jwtConf } = require("../../utils/configs");

// method to send a token along with payload to user as a response to login request
module.exports = (user, statusCode, req, res) => {
  // create token
  const token = signToken(user, '1d');

  // creating a cookie to send back to the user
  res.cookie("jwt", token, {
    // maxAge: new Date(Date.now() + jwtConf.expiresIn * 24 * 60 * 60 * 1000),
    maxAge: 5 * 60 * 60 * 1000,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

// method to sign the token along with the payload
const signToken = ({ _id, email, role }) => {
  return jwt.sign({ id: _id, email, role }, jwtConf.accessSecret, {
    expiresIn: "1h",
  });
};
