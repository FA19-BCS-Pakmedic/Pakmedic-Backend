const { GridFsStorage } = require("multer-gridfs-storage");

const { connectionString } = require("../configs/dbConfig");

module.exports = () => {
  const storage = new GridFsStorage({
    url: connectionString,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const fileInfo = {
          filename: file.originalname,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    },
  });
  return storage;
};
