// npm packages import
const multer = require("multer");
const path = require("path");

// import utils
const { catchAsync, AppError } = require("../utils/helpers");

module.exports = (filename, foldername, fieldname) => {
  return catchAsync(async (req, res, next) => {
    const PATH = path.join(__dirname, "../../public", foldername);

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, PATH);
      },
      filename: (req, file, cb) => {
        cb(null, `${filename}-${Date.now()}.${file.mimetype.split("/")[1]}`);
      },
    });

    const upload = multer({ storage });

    upload.single(fieldname)(req, res, (err) => {
      if (err) {
        return next(new AppError(err.message, 400));
      }
      next();
    });
  });
};
