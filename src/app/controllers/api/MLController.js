// importing utils
const { AppError, catchAsync } = require("../../utils/helpers");
require('dotenv').config();

const request = require("request");
const { Worker } = require("worker_threads");
const path = require("path");

const fetch = require("node-fetch");

const URL = process.env.URL;

exports.brainMRI = catchAsync(async (req, res, next) => {
  const worker = new Worker(
    path.join(__dirname, "../../utils/ML/MRI_background.js"),
    {
      workerData: {
        name: req?.query?.name,
        token: req?.body?.token,
        user: req?.body?.user,
      },
    }
  );

  worker.on("message", async (message) => {
    if (message[0] === "done") {
      await fetch(`http://localhost:8000/api/v1/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Your Results Are Ready",
          body: "Click here to view your results",
          user: message[3],
          tokenID: message[2],
          image: message[1],
          data: "test",
          navigate: "ResultsScreen",
        }),
      });
      console.log("Notification Sent Successfully.");
    }
  });
  res.send("Processing image...");
});

exports.chestXray = catchAsync(async (req, res, next) => {
  const worker = new Worker(
    path.join(__dirname, "../../utils/ML/Xray_background.js"),
    {
      workerData: {
        name: req?.query?.name,
        token: req?.body?.token,
        user: req?.body?.user,
      },
    }
  );

  worker.on("message", async (message) => {
    if (message[0] === "done") {
      await fetch(`http://localhost:8000/api/v1/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Your Results Are Ready",
          body: "Click here to view your results",
          user: message[3],
          tokenID: message[2],
          image: message[1],
          data: "test",
          navigate: "ResultsScreen",
        }),
      });
      console.log("Notification Sent Successfully.");
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
      if (error || response.statusCode !== 200) {
        // handle error response
        res.status(400).json({
          status: "error",
          message: "Something went wrong on Flask Server",
          error: error || body.error,
        });
      } else {
        // handle success response
        res.status(200).json({
          status: "success",
          data: {
            result: body,
          },
        });
      }
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
      if (error || response.statusCode !== 200) {
        // handle error response
        res.status(400).json({
          status: "error",
          message: "Something went wrong on Flask Server",
          error: error || body.error,
        });
      } else {
        // handle success response
        res.status(200).json({
          status: "success",
          data: {
            result: body,
          },
        });
      }
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
      if (error || response.statusCode !== 200) {
        // handle error response
        res.status(400).json({
          status: "error",
          message: "Something went wrong on Flask Server",
          error: error || body.error,
        });
      } else {
        // handle success response
        res.status(200).json({
          status: "success",
          data: {
            result: body,
          },
        });
      }
    }
  );
});

exports.bert = catchAsync(async (req, res, next) => {
  request.get(
    {
      url: "http://127.0.0.1:5001/bert",
      body: req.body,
      json: true,
    },
    function (error, response, body) {
      if (error || response.statusCode !== 200) {
        // handle error response
        res.status(400).json({
          status: "error",
          message: "Something went wrong on Flask Server",
          error: error || body.error,
        });
      } else {
        // handle success response
        res.status(200).json({
          status: "success",
          data: {
            result: body,
          },
        });
      }
    }
  );
});
