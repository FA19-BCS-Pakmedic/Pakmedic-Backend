const fs = require("fs");
const path = require("path");
const { fileDeleteSuccess } = require("../constants/RESPONSEMESSAGES");

// configuring multer

module.exports = (filename, folderName) => {
  let filePath;
  if (folderName) {
    const PATH = path.join(__dirname, "../../../public", folderName);
    filePath = `${PATH}/${filename}`;
  } else filePath = filename;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(fileDeleteSuccess);
    }
  });
};
