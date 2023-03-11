const request = require("request");
const fs = require("fs");

const { workerData, parentPort } = require("worker_threads");

const url = "http://127.0.0.1:5000/chestXray" + "?" + workerData.name;

request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("inside call");

    fs.writeFileSync("ML-Brilliance.png", body, "base64", function (err) {
      res.send(err);
    });
    parentPort.postMessage("done");
  }
});
