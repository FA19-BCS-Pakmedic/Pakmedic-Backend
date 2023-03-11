const request = require("request");
const fs = require("fs");

const { workerData, parentPort } = require("worker_threads");

const url = "http://127.0.0.1:5000/brainMRI" + "?" + workerData.name;

request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    fs.writeFileSync("MRI.png", body, "base64", function (err) {
      res.send(err);
    });
    parentPort.postMessage("done");
  }
});
