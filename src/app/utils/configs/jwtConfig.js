//getting the jwt secret from env file
require('dotenv').config();

module.exports = {

  accessSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  expiresIn: process.env.EXPIRES_IN,
};

// console.log(process.env.JWT_SECRET);
