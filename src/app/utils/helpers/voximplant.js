const VoximplantApiClient = require("@voximplant/apiclient-nodejs").default;

let client;
exports.init = async () => {
  return new Promise((resolve) => {
    client = new VoximplantApiClient(
      "./env/f0a13710-457b-4dd6-bf30-34731120a043_private.json"
    );

    client.onReady = function () {
      resolve();
    };
  });
};

exports.getClient = () => {
  return client;
};
