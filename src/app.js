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
  comment,
  post,
  community,
  file,
  appointment,
  ml,
  notification,
  stripe,
  appointmentRequest,
  admin: Admin,
  review,
  complaint,
  prescription,
  reminder,
} = require("./app/routes/api");

// Start express app
const app = express();

app.enable("trust proxy");

//Firebase Setup
var admin = require("firebase-admin");

var serviceAccount = require("../pakmedic-notifications-firebase-adminsdk-51eg2-b5d69d6e0e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
  max: 5000,
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

// app.use("/*", (req, res, next) => {
//   console.log(req.body);
//   res.send({ message: "response received" });
// });

app.use("/api/v1/patients", patient);
app.use("/api/v1/doctors", doctor);
app.use("/api/v1/chatbot", chatbot);
app.use("/api/v1/hospitals", hospital);
app.use("/api/v1/experiences", experience);
app.use("/api/v1/services", service);
app.use("/api/v1/families", family);
app.use("/api/v1/scans", scan);
app.use("/api/v1/reports", report);
app.use("/api/v1/communities", community);
app.use("/api/v1/posts", post);
app.use("/api/v1/comments", comment);
app.use("/api/v1/files", file);
app.use("/api/v1/appointments", appointment);
app.use("/api/v1/ML", ml);
app.use("/api/v1/notifications", notification);
app.use("/api/v1/stripe", stripe);
app.use("/api/v1/appointments/requests", appointmentRequest);
app.use("/api/v1/admin", Admin);
app.use("/api/v1/reviews", review);
app.use("/api/v1/complaints", complaint);
app.use("/api/v1/prescriptions", prescription);
app.use("/api/v1/reminder", reminder);

// any irrelavant end point will hit this and throw error
app.all("*", (req, res, next) => {
  next(new AppError(`${urlNotFound}: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
