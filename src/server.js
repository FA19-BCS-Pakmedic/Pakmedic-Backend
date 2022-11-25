//importing modules
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// import utils
const {
  uncaughtException,
  databaseConnected,
  serverRunning,
} = require("./app/utils/constants/RESPONSEMESSAGES");

// exiting the program in case of non operational error
process.on("uncaughtException", (err) => {
  console.log(uncaughtException);
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);
});

//setting the path to the env file
dotenv.config({ path: "../env/config.env" });

// importing local files
const app = require("./app");

// importing utils
const { dbConf, serverConf } = require("./app/utils/configs");

// setting database and connecting to it
const connectionString = `mongodb://${dbConf.HOST}:${dbConf.PORT}/${dbConf.DB}`;
const DB = mongoose.connect(connectionString);
console.log(databaseConnected);

// setting the server to run on a port
const server = app.listen(serverConf.PORT, () => {
  console.log(`${serverRunning} ${serverConf.PORT}`);
});

// handling non operational error and shutting server down
process.on("unhandledRejection", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// process.on("SIGTERM", () => {
//   console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
//   server.close(() => {
//     console.log("💥 Process terminated!");
//   });
// });
