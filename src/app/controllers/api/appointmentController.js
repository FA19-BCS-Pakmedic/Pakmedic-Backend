const { AppError, catchAsync } = require("../../utils/helpers");
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

    const notificationObj = {
      title: "New appoinment has been booked",
      body: `Appointment on date ${appointment.date.toLocaleString().split(",")[0]} and time ${appointment.time} has been booked`,
      user: appointment.doctor._id,
      navigate: "AppointmentDetails",
      data: appointment._id,
      image: null,
      tokenID: userNotification.tokenID,
    }
    
    await fetch(`http://localhost:8000/api/v1/notifications/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationObj),
    });

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