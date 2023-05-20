const cron = require("node-cron");

const Reminder = require("../models").reminder;
const Notification = require("../models").notification;
const { sendNotification } = require("./helpers");

module.exports = (time) => {
  return cron.schedule(time, async () => {
    console.log("running Cron Job");
    const currentDate = new Date().toLocaleString().split(",")[0];
    const Reminders = await Reminder.find({
      dosageDates: currentDate,
    });

    const users = [];
    for (const reminder of Reminders) {
      const notificationObj = await Notification.findOne({
        user: reminder.user,
      });
      if (
        notificationObj &&
        users.includes(reminder.user.toString()) === false
      ) {
        await sendNotification(
          "Medicine Reminder Alert",
          "Time to Take Your Medicine " + reminder.name,
          reminder.user,
          "MedicineScheduler",
          null,
          null,
          notificationObj.tokenID
        );
        users.push(reminder.user.toString());
      }
    }
  });
};
