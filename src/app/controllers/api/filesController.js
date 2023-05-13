const { getGridFsStream, catchAsync } = require("../../utils/helpers");

exports.getFile = catchAsync(async (req, res, next) => {
  const { filename } = req.params;

  try {
    const bucket = await getGridFsStream();

    const downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.on("data", (chunk) => {
      console.log(chunk);
      res.write(chunk);
    });

    downloadStream.on("error", () => {
      res.sendStatus(404);
    });

    downloadStream.on("end", () => {
      res.end();
    });
  } catch (err) {
    throw err;
  }
});

exports.addFile = catchAsync(async (req, res, next) => {
  const filename = req.file.filename;

  if (!filename) {
    return next(new AppError("No file uploaded", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      filename,
    },
  });
});
