// importing utils
const { AppError, catchAsync } = require("../../utils/helpers");
const factory = require("./handlerFactory");

const path = require("path");

const admin = require("firebase-admin");

const tokens = [
  "d8mkybw5Q-2197cC-A2G2S:APA91bENhyyBPGus2pN4D62hS6ipgbk0Ewkf2Zr9Ckhj72eFRaqnODV2lZ-kiqZwbqc4WVAz2Lf3yz5vy9Ai5hQrjl0VGCXYnJa1t73v0CLHcSmKhQzTx4SRShpQI-BbdMrz1CYII-4Q",
];

exports.register = catchAsync(async (req, res, next) => {
  console.log(tokens);
  res.status(200).json({ message: "Successfully registered FCM Token!" });
});

exports.sendNotification = catchAsync(async (req, res, next) => {
  try {
    const { title, body, imageUrl } = req.body;

    console.log(tokens);
    await admin.messaging().sendMulticast({
      tokens,
      data: {
        notifee: JSON.stringify({
          title: "Results Are Ready!",
          body: "Click here to view your results",
          android: {
            smallIcon: "logo_circle",
            channelId: "default",
            importance: 4,
            actions: [
              {
                title: "Mark as Read",
                pressAction: {
                  id: "read",
                },
              },
            ],
          },
        }),
      },
    });
    res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
});
