const request = require("request");
const gridfsFileStream = require("../../utils/helpers/gridfsFileStream");
const uuid = require("uuidv4");
const fs = require("fs");

const stream = require("stream");

const { workerData, parentPort } = require("worker_threads");

const url = "http://127.0.0.1:5000/brainMRI" + "?" + workerData.name;

request(url, async (error, response, body) => {
  if (!error && response.statusCode == 200) {
    // fs.writeFileSync("MRI.png", body, "base64", function (err) {
    //   res.send(err);
    // });
    // parentPort.postMessage("done");

    var buf = Buffer.from(body, "base64");

    const filename = uuid.uuid().split("-")[0] + "-" + "MRI_Diagnosis.png";

    const metadata = {
      author: "Machine Learning",
      date: new Date(),
      description: "Diagnosis of Brain MRI",
    };

    const bucket = await gridfsFileStream();

    const uploadStream = bucket.openUploadStream(filename, {
      metadata,
      contentType: "application/png",
    });

    const fileStream = stream.Readable.from(buf);

    fileStream.pipe(uploadStream);

    uploadStream.on("finish", (_id, file, metadata) => {
      console.log(`File ${filename} has been uploaded to MongoDB`);
    });

    parentPort.postMessage(["done", filename, workerData.token]);
  }
});
