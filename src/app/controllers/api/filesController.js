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
