const mongodb = require("mongodb");
const { connectionString } = require("../configs/dbConfig");

module.exports = async () => {
  let bucket;
  try {
    const client = await mongodb.MongoClient.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();
    bucket = new mongodb.GridFSBucket(db, {
      bucketName: "uploads",
    });
  } catch (err) {
    throw err;
  }
  return bucket;
};

