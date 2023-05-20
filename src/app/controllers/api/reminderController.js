const { AppError, catchAsync } = require("../../utils/helpers");
const Reminder = require("../../models").reminder;
const mongoose = require("mongoose");

const factory = require("./handlerFactory");

function addDays(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

exports.createReminder = catchAsync(async (req, res, next) => {
  const { user, tokenID, startDate, duration } = req.body;

  const objID = mongoose.Types.ObjectId.isValid(user)
    ? mongoose.Types.ObjectId(user)
    : null;

  if (!objID) {
    return next(new AppError("Invalid User ID", 400));
  }

  req.body.startDate = new Date(startDate).toLocaleString().split(",")[0];

  var endDate = addDays(new Date(startDate), Number(duration));

  endDate = endDate.toLocaleString().split(",")[0];

  const reminder = new Reminder(req.body);

  reminder.endDate = endDate;

  await reminder.save();

  res.status(201).json({
    status: "success",
    reminder,
  });
});

// get all appointments for a specfic doctor or patient
exports.getAllReminders = factory.getAll(Reminder);
