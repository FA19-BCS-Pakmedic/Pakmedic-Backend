const { AppError, catchAsync } = require("../../utils/helpers");
const Appointment = require("../../models").appointment;

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
exports.getAllAppointments = catchAsync(async (req, res, next) => {
  const data = req.body;

  const appointments = await Appointment.find(data);

  res.status(200).json({
    status: "success",
    data: {
      appointments,
    },
  });
});
