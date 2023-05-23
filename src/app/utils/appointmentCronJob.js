const cron = require("node-cron");

const Appointment = require("../models").appointment;
const Notification = require("../models").notification;
const { sendNotification } = require("./helpers");

module.exports = () => (
    cron.schedule("0 6 * * *", async () => {

        console.log("running appointment cron job");

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);  // Set the time to midnight


        await Appointment.updateMany({ date: { $lt: currentDate } }, { $set: { status: 'completed' } });

        // find appointments grouped by doctor field
        const appointments = await Appointment.aggregate([
            { $match: { date: currentDate, status: 'upcoming' } },
            { $group: {
              _id: '$doctor',
              appointments: { $push: '$$ROOT' }
            }}
        ]);

        for (const appointment of appointments) {

            const doctor = appointment.appointments[0].doctor;

            console.log(doctor);

            const notificationObj = await Notification.findOne({ user: doctor });

            
            if (notificationObj) {
                await sendNotification(
                    "Appointment Reminder Alert",
                    "You have an appointment today",
                    doctor.toString(),
                    "AppointmentScreen",
                    appointment.appointments[0]._id,
                    "",
                    notificationObj.tokenID
                );
            }
        }

        

    }));
