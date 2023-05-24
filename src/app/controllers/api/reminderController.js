const { AppError, catchAsync } = require("../../utils/helpers");
const Reminder = require("../../models").reminder;
const Notification = require("../../models").notification;
const { sendNotification } = require("../../utils/helpers");

const mongoose = require("mongoose");

const factory = require("./handlerFactory");

function addDays(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JavaScript Date
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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

  const startDateParts = req.body.startDate.split("/");
  const endDateParts = endDate.split("/");

  const startDay = parseInt(startDateParts[0], 10);
  const startMonth = parseInt(startDateParts[1], 10) - 1; // Months are zero-based in JavaScript Date
  const startYear = parseInt(startDateParts[2], 10);

  const endDay = parseInt(endDateParts[0], 10);
  const endMonth = parseInt(endDateParts[1], 10) - 1; // Months are zero-based in JavaScript Date
  const endYear = parseInt(endDateParts[2], 10);

  const startDateObj = new Date(startYear, startMonth, startDay);
  const endDateObj = new Date(endYear, endMonth, endDay);

  // Create an array of dates from startDate to endDate
  const dosageDates = [];
  const currentDate = new Date(startDateObj);
  while (currentDate < endDateObj) {
    dosageDates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  reminder.dosageDates = dosageDates;

  await reminder.save();

  res.status(201).json({
    status: "success",
    reminder,
  });
});

// get all appointments for a specfic doctor or patient
exports.getAllReminders = factory.getAll(Reminder);

exports.printReminder = catchAsync(async (req, res, next) => {
  const currentDate = new Date().toLocaleString().split(",")[0];
  const Reminders = await Reminder.find({
    dosageDates: currentDate,
  });

  const users = [];
  for (const reminder of Reminders) {
    const notificationObj = await Notification.findOne({ user: reminder.user });
    if (notificationObj && users.includes(reminder.user.toString()) === false) {
      await sendNotification(
        "Medicine Reminder Alert",
        "Time to Take Your Medicine " + reminder.name,
        reminder.user,
        "MedicineScheduler",
        "test",
        null,
        notificationObj.tokenID
      );
      users.push(reminder.user.toString());
    }
  }

  res.status(200).json({
    status: "success",
    Reminders,
  });
});
