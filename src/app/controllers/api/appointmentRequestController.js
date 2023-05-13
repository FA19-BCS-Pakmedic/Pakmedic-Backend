const { AppError, catchAsync } = require("../../utils/helpers");

const {} = require("../../utils/constants/RESPONSEMESSAGES");

const AppointmentReq = require("../../models").appointmentReq;
const Appointment = require("../../models").appointment;

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
