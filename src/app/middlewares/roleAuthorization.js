const { AppError } = require("../utils/helpers");
const { noPermission } = require("../utils/constants/RESPONSEMESSAGES");
module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.decoded.role)) {
      return next(new AppError(noPermission, 403));
    }
    next();
  };
};
