// const express = require("express");
// const request = require("request");
// var fs = require("fs");
// var bodyParser = require("body-parser");
// const { Worker } = require("worker_threads");
// const path = require("path");

// app = express();

// app.use(bodyParser.json());

// const PORT = 3000;

// app.get("/brainMRI", async (req, res) => {
//   const worker = new Worker(path.join(__dirname, "/utils/MRI_background.js"), {
//     workerData: { name: req.query.name },
//   });
//   worker.on("message", (message) => {
//     if (message === "done") {
//       console.log("MRI Saved Successfully.");
//     }
//   });
//   res.send("Processing image...");
// });

// app.get("/chestXray", async (req, res) => {
//   const worker = new Worker(path.join(__dirname, "/utils/Xray_background.js"), {
//     workerData: { name: req.query.name },
//   });

//   worker.on("message", (message) => {
//     if (message === "done") {
//       console.log("XRAY Saved Successfully.");
//     }
//   });
//   res.send("Processing image...");
// });

// app.get("/retinopathy", async (req, res) => {
//   //Values in the following order AGE, Systolic BP, Diastolic BP, Cholestrol Value
//   request.get(
//     {
//       url: "http://127.0.0.1:5000/retinopathy",
//       body: req.body,
//       json: true,
//     },
//     function (error, response, body) {
//       res.send(body);
//     }
//   );
// });

// app.get("/riskOfDeath", async (req, res) => {
//   //Values to be sent in the body
//   // ValuesSequence = ["Age",
//   //                 "DiastolicBP",
//   //                 "Povertyindex",
//   //                 "Race",
//   //                 "RedBloodcells",
//   //                 "SedimentationRate",
//   //                 "SerumAlbumin",
//   //                 "SerumCholesterol",
//   //                 "SerumIron",
//   //                 "SerumMagnesium",
//   //                 "SerumProtein",
//   //                 "Sex" ,
//   //                 "SystolicBP" ,
//   //                 "TIBC" ,
//   //                 "TS(TransferrinSaturation)",
//   //                 "Whitebloodcells",
//   //                 "BMI",
//   //                 "Pulse pressure"]

//   request.get(
//     {
//       url: "http://127.0.0.1:5000/riskOfDeath",
//       body: req.body,
//       json: true,
//     },
//     function (error, response, body) {
//       res.send(body);
//     }
//   );
// });

// app.get("/recommendcompound", async (req, res) => {
//   request.get(
//     {
//       url: "http://127.0.0.1:5000/recommendcompound",
//       body: req.body,
//       json: true,
//     },
//     function (error, response, body) {
//       res.send(body);
//     }
//   );
// });

// app.get("/", function (req, res) {
//   res.send("Hello World");
// });

// app.listen(PORT, function () {
//   console.log("Listening on Port 3000");
// });
