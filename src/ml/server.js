const express = require("express");
const request = require("request");
var fs = require("fs");
var bodyParser = require("body-parser");

app = express();

app.use(bodyParser.json());

const PORT = 3000;

app.get("/chestXray", async (req, res) => {
  await request(
    "http://127.0.0.1:5000/chestXray",
    function (error, response, body) {
      fs.writeFileSync("ML-Brilliance.png", body, "base64", function (err) {
        res.send(Error);
      });

      res.send("Image Saved Successfully.");
    }
  );
});

app.get("/retinopathy", async (req, res) => {
  await request.get(
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

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.listen(PORT, function () {
  console.log("Listening on Port 3000");
});
