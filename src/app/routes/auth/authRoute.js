// importing npm packages
const express = require("express");
const { check } = require("express-validator");

// importing controllers
const {
  signup,
  login,
  googleLogin,
  facebookLogin,
} = require("../../controllers/auth/authController");

// importing middlewares

const { checkDuplicatePatient } = require("../../middlewares");




//initializing router
const router = express.Router();

router.use(function (req, res, next) {
  //   console.log("/auth endpoint is beign hit");
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// route to sign user up
router.post(
  "/signup",
  [
    check("email", "Please enter a valid email").isEmail(),

    checkDuplicatePatient,

    check(
      "password",
      "Please enter a password at least 8 character and contain at least one uppercase, one lower case, and one special character."
    )
      .isLength({ min: 8 })
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/),
  ],
  signup
);

// route to log user in
router.post("/login", login);

// route to register/login user using his google email
router.post("/google", googleLogin);

// route to register/login user using his facebook email
router.post("/facebook", facebookLogin);

module.exports = router;
