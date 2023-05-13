//importing modules
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");

const socketServer = require("./app/socket/socket");

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
dotenv.config({ path: path.join(__dirname, "..", "env", "config.env") });

// importing local files
const app = require("./app");

// importing utils
const { serverConf } = require("./app/utils/configs");
const { connectionString } = require("./app/utils/configs/dbConfig");

// setting database and connecting to it
mongoose.connect(connectionString);
console.log(databaseConnected);

const server = http.createServer(app);

socketServer(server);

// setting the server to run on a port
server.listen(serverConf.PORT, () => {
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
