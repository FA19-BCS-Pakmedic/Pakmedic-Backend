// initializing a database config object with keys and values from the env file and other default options

// console.log(process.env.DB_PORT, process.env.DB_HOST, process.env.DB_DATABASE);
// console.log(process.env.DB_PORT, process.env.DB_HOST, process.env.DB_DATABASE);
require('dotenv').config();

const dbConf = {
  PORT: process.env.DB_PORT || 8080,
  HOST: process.env.DB_HOST || "localhost",
  DB: process.env.DB_DATABASE || "pakmedic",
  options: {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  },
};
const connectionString = process.env.MONGO_CONNECTION_STRING;
// const connectionString = `mongodb://${dbConf.HOST}:${dbConf.PORT}/${dbConf.DB}`;


module.exports = { dbConf, connectionString };
