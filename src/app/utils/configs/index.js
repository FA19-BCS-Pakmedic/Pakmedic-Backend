configs = {};

configs.corsConf = require("./corsConfig");
configs.jwtConf = require("./jwtConfig");
configs.dbConf = require("./dbConfig");
configs.serverConf = require("./serverConfig");
configs.pmcConf = require("./pmcConfig");
configs.mapsConf = require("./mapsConfig");
configs.mailConf = require("./mailConfig");
configs.dfConf = require("./dfConfig");
module.exports = configs;
