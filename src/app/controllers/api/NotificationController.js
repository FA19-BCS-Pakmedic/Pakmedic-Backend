// importing utils
const { AppError, catchAsync } = require("../../utils/helpers");
const factory = require("./handlerFactory");
const mongoose = require("mongoose");

const Notification = require("../../models/Notification");

const path = require("path");

const admin = require("firebase-admin");

const tokens = [
  "d8mkybw5Q-2197cC-A2G2S:APA91bENhyyBPGus2pN4D62hS6ipgbk0Ewkf2Zr9Ckhj72eFRaqnODV2lZ-kiqZwbqc4WVAz2Lf3yz5vy9Ai5hQrjl0VGCXYnJa1t73v0CLHcSmKhQzTx4SRShpQI-BbdMrz1CYII-4Q",
];

exports.registerNotification = catchAsync(async (req, res, next) => {
  const { user, tokenID } = req.body;

  const objID = mongoose.Types.ObjectId.isValid(user)
    ? mongoose.Types.ObjectId(user)
    : null;

  if (!objID) {
    return next(new AppError("Invalid User ID", 400));
  }
  const obj = await Notification.findOne({ user: user });

  if (obj)
    return res.status(200).json({
      status: "success",
      data: {
        message: "Token already registered!",
      },
    });

  return factory.createOne(Notification)(req, res, next);
});

exports.updateNotification = catchAsync(async (req, res, next) => {
  const userID = req?.query?.userid;

  const objID = mongoose.Types.ObjectId.isValid(userID)
    ? mongoose.Types.ObjectId(userID)
    : null;

  if (!objID) {
    return next(new AppError("Invalid User ID", 400));
  }

  const obj = await Notification.findOne({ user: userID });

  if (!obj) {
    return next(new AppError("No Document Found", 404));
  }

  req.params.id = obj._id;
  return factory.updateOne(Notification)(req, res, next);
});

exports.sendNotification = catchAsync(async (req, res, next) => {
  try {
    const { title, body, navigate, tokenID, image } = req.body;

    const obj = await Notification.findOne({ token: tokenID });

    const notification = {
      title: title ? title : "Results Are Ready!",
      body: body ? body : "Click here to view your results",
      data: {
        navigate: navigate ? navigate : "Xray",
        image: image ? image : "default",
      },
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
    };

    obj.notifications.push(notification);
    await obj.save();

    await admin.messaging().sendMulticast({
      tokens: [tokenID],
      data: {
        notifee: JSON.stringify(notification),
      },
    });

    res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
});
