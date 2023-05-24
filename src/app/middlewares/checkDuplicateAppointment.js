const Appointment = require('../models').appointment;

const checkDuplicateAppointment = async (req, res, next) => {

    const patientId = req.body.patient;

    const doctorId = req.body.doctor;

    const appointmentAlreadyBooked = await Appointment.findOne({
        patient: patientId,
        doctor: doctorId,
        status: "upcoming",
    });

    if (appointmentAlreadyBooked) { 
        return res.status(400).json({
            status: "fail",
            message: "You have already booked an appointment with this doctor",
        });
    }
    
    next();
}


module.exports = checkDuplicateAppointment;

