// npm modules import
const path = require("path");
const express = require("express");
const logger = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

// const fileUpload = require("express-fileupload");

// importing utils
const { AppError } = require("./app/utils/helpers");
const {
  tooManyRequests,
  urlNotFound,
} = require("./app/utils/constants/RESPONSEMESSAGES");

// importing controllers
const globalErrorHandler = require("./app/controllers/errorController");

// importing routers
// const authRoute = require("./app/routes/auth/authRoute");

const {
  patient,
  doctor,
  chatbot,
  hospital,
  experience,
  service,
  family,
  scan,
  report,
} = require("./app/routes/api");

// Start express app
const app = express();

app.enable("trust proxy");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());

app.options("*", cors());

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: tooManyRequests,
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Compress all responses
app.use(compression());

// file upload middleware
// app.use(fileUpload());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// Api endpoints
app.use("/api/v1/patients", patient);
app.use("/api/v1/doctors", doctor);
app.use("/api/v1/chatbot", chatbot);
app.use("/api/v1/hospitals", hospital);
app.use("/api/v1/experiences", experience);
app.use("/api/v1/services", service);
app.use("/api/v1/families", family);
app.use("/api/v1/scans", scan);
app.use("/api/v1/reports", report);

// any irrelavant end point will hit this and throw error
app.all("*", (req, res, next) => {
  next(new AppError(`${urlNotFound}: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

// console.log("Imports work");
