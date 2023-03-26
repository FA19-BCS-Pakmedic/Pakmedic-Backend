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
