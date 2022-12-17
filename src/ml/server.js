const express = require("express");
const request = require("request");
var fs = require("fs");
const { json } = require("body-parser");

app = express();
const PORT = 3000;

const encode = (data) => {
  let buf = Buffer.from(data);
  let base64 = buf.toString("base64");
  return base64;
};

app.get("/home", async (req, res) => {
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

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/non-blocking", (req, res) => {
  res.status(200).send("This page is non-blocking");
});

app.get("/blocking", async (req, res) => {
  let counter = 0;
  for (let i = 0; i < 20_000_000_000; i++) {
    counter++;
  }
  res.status(200).send(`result is ${counter}`);
});

app.listen(PORT, function () {
  console.log("Listening on Port 3000");
});
