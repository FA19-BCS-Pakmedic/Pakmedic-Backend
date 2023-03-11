// importing npm packages
const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

//importing utils
const { catchAsync, AppError } = require("../../utils/helpers");
const { dfConf } = require("../../utils/configs");

// importing response messages
const { noDoctorsFound } = require("../../utils/constants/RESPONSEMESSAGES");
const { doctor } = require("../../models");

//importing doctors models
const Doctor = require("../../models").doctor;

exports.chatWithBot = catchAsync(async (req, res, next) => {
  console.log(dfConf);
  // dialog flow configurations
  const configuration = dfConf;
  const sessionId = req.body.sessionId;
  const message = req.body.message;

  //create a new session
  const sessionClient = new dialogflow.SessionsClient(configuration);

  const sessionPath = sessionClient.projectAgentSessionPath(
    configuration.project_id,
    sessionId
  );

  //creating a text query object to send it to the chatbot
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: "en-US",
      },
    },
  };

  // sending the request to the chatbot
  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  console.log(result);

  console.log(responses[0]);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log("  No intent matched.");
  }
  res.status(200).json({
    status: "success",
    data: {
      message: result.fulfillmentText,
      intent: result.intent.displayName,
    },
  });
});

// find the doctors based on the patient's location
exports.findSpecialists = catchAsync(async (req, res, next) => {
  const speciality = req.body.speciality;
  const location = req.body.location;

  const doctors = await Doctor.find({
    speciality: speciality,
    location: location,
  });

  if (!doctors.length > 0) {
    return next(new AppError(noDoctorsFound, 404));
  }

  res.status(200).json({
    status: "success",
    // results: doctors.length,
    data: doctors,
  });

  // console.log(doctors);
});
