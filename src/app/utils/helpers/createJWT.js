// importing packages
const jwt = require("jsonwebtoken");
const { jwtConf } = require("../../utils/configs");

// method to send a token along with payload to user as a response to login request
module.exports = (user, statusCode, req, res) => {
  // create token
  const token = signToken(user);

  // const data = {
  //   id: user._id,
  //   name: user.name,
  //   email: user.email,
  //   role: user.role,
  //   avatar: user.avatar,
  //   gender: user.gender,
  //   phone: user.phone,
  //   dob: user.dob,
  //   cnic: user.cnic,
  //   address: user.address,
  //   bio: user.bio,
  // };

  // creating a cookie to send back to the user
  res.cookie("jwt", token, {
    // maxAge: new Date(Date.now() + jwtConf.expiresIn * 24 * 60 * 60 * 1000),
    maxAge: 2 * 60 * 60 * 1000,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    // data,
  });
};

// method to sign the token along with the payload
const signToken = ({ _id, email, role }) => {
  return jwt.sign({ id: _id, email, role }, jwtConf.accessSecret, {
    expiresIn: "1h",
  });
};
