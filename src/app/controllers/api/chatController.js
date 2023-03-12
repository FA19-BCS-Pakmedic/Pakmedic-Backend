const { message } = require("../../models");

const { AppError, catchAsync } = require("../../utils/helpers");

const { messagesNotFound } = require("../../utils/constants/RESPONSEMESSAGES");

exports.getMessages = catchAsync(async (req, res, next) => {
  const roomId = req.params.roomId;

  const messages = await message.find({ roomId }).sort({ createdAt: -1 });

  if (!messages) {
    return next(new AppError(messagesNotFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      messages,
    },
  });
});
