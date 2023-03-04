const express = require("express");
const request = require("request");
var fs = require("fs");
var bodyParser = require("body-parser");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

app = express();

app.use(bodyParser.json());

const PORT = 3000;

app.get("/chestXray", async (req, res) => {
  request(
    "http://127.0.0.1:5000/chestXray" + "?" + req.query.name,
    function (error, response, body) {
      fs.writeFileSync("ML-Brilliance.png", body, "base64", function (err) {
        res.send(Error);
      });

      res.send("Image Saved Successfully.");
    }
  );
});

app.get("/retinopathy", async (req, res) => {
  //Values in the following order AGE, Systolic BP, Diastolic BP, Cholestrol Value
  request.get(
    {
      url: "http://127.0.0.1:5000/retinopathy",
      body: req.body,
      json: true,
    },
    function (error, response, body) {
      res.send(body);
    }
  );
});

app.get("/riskOfDeath", async (req, res) => {
  //Values to be sent in the body
  // ValuesSequence = ["Age",
  //                 "DiastolicBP",
  //                 "Povertyindex",
  //                 "Race",
  //                 "RedBloodcells",
  //                 "SedimentationRate",
  //                 "SerumAlbumin",
  //                 "SerumCholesterol",
  //                 "SerumIron",
  //                 "SerumMagnesium",
  //                 "SerumProtein",
  //                 "Sex" ,
  //                 "SystolicBP" ,
  //                 "TIBC" ,
  //                 "TS(TransferrinSaturation)",
  //                 "Whitebloodcells",
  //                 "BMI",
  //                 "Pulse pressure"]

  request.get(
    {
      url: "http://127.0.0.1:5000/riskOfDeath",
      body: req.body,
      json: true,
    },
    function (error, response, body) {
      res.send(body);
    }
  );
});

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.listen(PORT, function () {
  console.log("Listening on Port 3000");
});
