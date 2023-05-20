const { AppError, catchAsync, sendNotification } = require("../../utils/helpers");

const {} = require("../../utils/constants/RESPONSEMESSAGES");

const AppointmentReq = require("../../models").appointmentReq;
const Appointment = require("../../models").appointment;
const Notification = require("../../models").notification;


const factory = require("./handlerFactory");

exports.createAppointmentReq = factory.createOne(AppointmentReq);

exports.getAllAppointmentReqs = factory.getAll(AppointmentReq);

exports.updateAppointmentReq = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedAppointmentReq = await AppointmentReq.findByIdAndUpdate(
    id,
    { $set: { ...req.body } },
    { new: true }
  );

  if (!updatedAppointmentReq) {
    return next(new AppError("No Appointment Request Found", 404));
  } 

  const { appointment, time, date } = updatedAppointmentReq;

  console.log(appointment);

  if (updatedAppointmentReq.isApproved) {
    let updatedAppointment;
    if (updatedAppointmentReq.requestType === "reschedule") {
      updatedAppointment = await Appointment.findByIdAndUpdate(
        appointment,
        { $set: { time, date } },

        { new: true }
      );
    } else if (updatedAppointmentReq.requestType === "cancel") {
      updatedAppointment = await Appointment.findByIdAndUpdate(
        appointment,
        { $set: { status: "cancelled" } },
        { new: true }
      );
    }



    if (!updatedAppointment) {
      return next(new AppError("No Appointment Found", 404));
    }

    const appointmentRequest = await AppointmentReq.findById(id);

    if (!appointmentRequest) {
      return next(new AppError("No Appointment Request Found", 404));
    }

    
    const requestedBy = appointmentRequest.requestedBy;
    const user = appointmentRequest.userType === "Doctor" ? appointmentRequest.appointment.patient : appointmentRequest.appointment.doctor;
    
    let noti1 = Notification.findOne({user: requestedBy._id}).exec();
    let noti2 = Notification.findOne({user: user}).exec();
    

    const [data1, data2] = await Promise.all([noti1, noti2]);

    console.log(data1.tokenID, data2.tokenID);

    if( data1 ) {
      await sendNotification(
        `Your appointment request has been accepted`,
        `New Appointment date ${updatedAppointment.date.toLocaleString().split(",")[0]} and time ${updatedAppointment.time}`,
        requestedBy,
        "AppointmentDetails",
        updatedAppointment._id,
        null,
        data1.tokenID,
      )
    }
    if( data2 ) {
      await sendNotification(
        `Your appointment with ${requestedBy.name} has been ${appointmentRequest.requestType}`,
        `New Appointment date ${updatedAppointment.date.toLocaleString().split(",")[0]} and time ${updatedAppointment.time}`,
        user,
        "AppointmentDetails",
        updatedAppointment._id,
        null,
        data2.tokenID,
      )
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      updatedAppointmentReq,
    },
  });
});

exports.getAppointmentReq = factory.getOne(AppointmentReq);

exports.deleteAppointmentReq = factory.deleteOne(AppointmentReq);
