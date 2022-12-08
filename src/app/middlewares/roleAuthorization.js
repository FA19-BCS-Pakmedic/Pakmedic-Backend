const { AppError } = require("../utils/helpers");
const { noPermission } = require("../utils/constants/RESPONSEMESSAGES");
module.exports = (...roles) => {
  return (req, res, next) => {
    console.log(roles);
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(new AppError(noPermission, 403));
    }
    next();
  };
};
