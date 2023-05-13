configs = {};

configs.corsConf = require("./corsConfig");
configs.jwtConf = require("./jwtConfig");
configs.dbConf = require("./dbConfig");
configs.serverConf = require("./serverConfig");
configs.pmcConf = require("./pmcConfig");
configs.mapsConf = require("./mapsConfig");
configs.mailConf = require("./mailConfig");
configs.ipConf = require("./ipConfig");
configs.dfConf = require("./dfConfig");
configs.stripeConf = require("./stripeConfig");
module.exports = configs;
