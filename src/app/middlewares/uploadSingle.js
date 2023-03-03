const multer = require("multer");

const { getGridFsStorage, catchAsync, AppError } = require("../utils/helpers");

const upload = multer({ storage: getGridFsStorage() });

module.exports = () => {
  return catchAsync(async (req, res, next) => {

    console.log(req);

    upload.single("file")(req, res, (err) => {
      if (err) {
        return AppError(err.message, 400);
      }
      next();
    });
  });
};
