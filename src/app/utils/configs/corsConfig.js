const ORIGINS = require("../constants/ALLOWEDORIGINS");

const corsOptions = {
  origin: (origin, callback) => {
    if (ORIGINS.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
