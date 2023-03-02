const mongodb = require("mongodb");
const { connectionString } = require("../configs/dbConfig");

module.exports = async (filename) => {
  try {
    const client = await mongodb.MongoClient.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();
    const bucket = new GridFsBucketReadStream(db, { filename });
    return bucket;
  } catch (err) {
    throw err;
  }
};
