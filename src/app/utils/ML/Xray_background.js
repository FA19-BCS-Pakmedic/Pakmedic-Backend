const request = require("request");
const fs = require("fs");
const gridfsFileStream = require("../../utils/helpers/gridfsFileStream");
const uuid = require("uuidv4");

const stream = require("stream");

const { workerData, parentPort } = require("worker_threads");

const url = "http://127.0.0.1:5000/chestXray" + "?" + workerData.name;

request(url, async (error, response, body) => {
  if (!error && response.statusCode == 200) {
    var buf = Buffer.from(body, "base64");

    const filename = uuid.uuid().split("-")[0] + "-" + "Diagnosis.png";

    const metadata = {
      author: "Machine Learning",
      date: new Date(),
      description: "Diagnosis of Chest Xray",
    };

    const bucket = await gridfsFileStream();

    const uploadStream = bucket.openUploadStream(filename, {
      metadata,
      contentType: "application/png",
    });

    const fileStream = stream.Readable.from(buf);

    fileStream.pipe(uploadStream);

    uploadStream.on("finish", (_id, filename, metadata) => {
      console.log(`File ${filename} has been uploaded to MongoDB`);
    });

    parentPort.postMessage(["done", filename, workerData.token]);
  }
});
