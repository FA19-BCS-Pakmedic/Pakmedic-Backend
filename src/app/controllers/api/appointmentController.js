const { AppError, catchAsync, sendNotification } = require("../../utils/helpers");
const Appointment = require("../../models").appointment;
const Notification = require('../../models').notification;
const fetch = require("node-fetch");

const factory = require("./handlerFactory");

exports.createAppointment = catchAsync(async (req, res, next) => {
  const data = req.body;

  const appointment = new Appointment(data);

  await appointment.save();

  const userNotification = await Notification.findOne({user: appointment.doctor});


  if(userNotification) {
    await sendNotification(
      "New appoinment has been booked",
      `Appointment on date ${appointment.date.toLocaleString().split(",")[0]} and time ${appointment.time} has been booked`,
      appointment.doctor._id,
      "AppointmentDetails",
      appointment._id,
      null,
      userNotification.tokenID,
    )
  }
  
  res.status(201).json({
    status: "success",
    data: {
      appointment,
    },
  });
});




// get all appointments for a specfic doctor or patient
exports.getAllAppointments = factory.getAll(Appointment);


exports.getAppointment = factory.getOne(Appointment);