// import utils
const { userNotFound } = require("../utils/constants/RESPONSEMESSAGES");
const { AppError, catchAsync, deleteFile } = require("../utils/helpers");

// importing models
const Family = require("../models").family;

module.exports = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const family = await Family.findById(id)
    .populate({
      path: "reports",
      model: "Report",
    })
    .populate({
      path: "scans",
      model: "Scan",
    });

  if (!family) {
    return next(new AppError(`Family member ${userNotFound}`, 404));
  }

  // delete the doctor's experiences
  const reports = family.reports;
  const scans = family.scans;

  if (reports.length > 0) await removeEmbeddedFields(reports);
  if (scans.length > 0) await removeEmbeddedFields(scans);

  next();
});

// function will work for both experience and service model
const removeEmbeddedFields = async (data) => {
  try {
    data.forEach(async (item) => {
      // delete the image of the hospital
      deleteFile(item.image, "images"); // this will be replaced with multiple files delete function after it is implemented

      await item.remove();
    });
  } catch (err) {
    console.log(err);
  }
};
