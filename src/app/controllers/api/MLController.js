// importing utils
const { AppError, catchAsync } = require("../../utils/helpers");

const request = require("request");
const { Worker } = require("worker_threads");
const path = require("path");

exports.brainMRI = catchAsync(async (req, res, next) => {
  const worker = new Worker(
    path.join(__dirname, "../../utils/ML/MRI_background.js"),
    {
      workerData: { name: req.query.name },
    }
  );
  worker.on("message", (message) => {
    if (message === "done") {
      console.log("MRI Saved Successfully.");
    }
  });
  res.send("Processing image...");
});

exports.chestXray = catchAsync(async (req, res, next) => {
  const worker = new Worker(
    path.join(__dirname, "../../utils/ML/Xray_background.js"),
    {
      workerData: { name: req.query.name },
    }
  );

  worker.on("message", (message) => {
    if (message === "done") {
      console.log("XRAY Saved Successfully.");
    }
  });
  res.send("Processing image...");
});

exports.retinopathy = catchAsync(async (req, res, next) => {
  //Values in the following order AGE, Systolic BP, Diastolic BP, Cholestrol Value
  request.get(
    {
      url: "http://127.0.0.1:5000/retinopathy",
      body: req.body,
      json: true,
    },
    function (error, response, body) {
      res.status(200).json({
        status: "success",
        data: {
          result: body,
        },
      });
    }
  );
});

exports.riskOfDeath = catchAsync(async (req, res, next) => {
  request.get(
    {
      url: "http://127.0.0.1:5000/riskOfDeath",
      body: req.body,
      json: true,
    },
    function (error, response, body) {
      res.status(200).json({
        status: "success",
        data: {
          result: body,
        },
      });
    }
  );
});

exports.recommendcompound = catchAsync(async (req, res, next) => {
  request.get(
    {
      url: "http://127.0.0.1:5000/recommendcompound",
      body: req.body,
      json: true,
    },
    function (error, response, body) {
      res.status(200).json({
        status: "success",
        data: {
          result: body,
        },
      });
    }
  );
});
