const { AppError, catchAsync } = require("../../utils/helpers");
const Appointment = require("../../models").appointment;

const factory = require("./handlerFactory");

exports.createAppointment = catchAsync(async (req, res, next) => {
  const data = req.body;

  const appointment = new Appointment(data);

  await appointment.save();

  res.status(201).json({
    status: "success",
    data: {
      appointment,
    },
  });
});




// get all appointments for a specfic doctor or patient
exports.getAllAppointments = factory.getAll(Appointment);


exports.getAppointmentsGroupedByMonths = catchAsync(async(req, res, next) => {


  const currentYear = new Date().getFullYear();

  console.log(currentYear);

const appointmentsByMonth = await Appointment.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lt: new Date(`${currentYear + 1}-01-01`),
      },
    },
  },
  {
    $lookup: {
      from: "services",
      localField: "service",
      foreignField: "_id",
      as: "service",
    },
  },
  {
    $unwind: "$service",
  },
  {
    $group: {
      _id: {
        month: { $month: "$createdAt" },
        isOnline: "$service.isOnline",
      },
      count: { $sum: 1 },
    },
  },
  {
    $sort: { "_id.month": 1 },
  },

  {
    $group: {
      _id: "$_id.isOnline",
      data: {
        $push: {
          k: {
            $concat: [
              { $toString: "$_id.month" },
              " - ",
              { $substr: [{ $year: "$createdAt" }, 0, 4] },
            ],
          },
          v: "$count",
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      type: "$_id",
      data: {
        $arrayToObject: "$data",
      },
    },
  },
]);


const onlineCounts = appointmentsByMonth
  .find(({ type }) => type === true)
  .data;

const physicalCounts = appointmentsByMonth
  .find(({ type }) => type === false)
  .data;


const months = [];

for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
  const monthDate = new Date(currentYear, monthIndex, 1);
  const formattedDate = `${monthDate.getDate().toString().padStart(2, '0')}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}-${currentYear}`;

  months.push(formattedDate);
}



res.status(200).json({
  status: "success",
  data: {
    appointmentsByMonth,
    online: Object.values(onlineCounts),
    physical: Object.values(physicalCounts),
    months,
  },
});




})
