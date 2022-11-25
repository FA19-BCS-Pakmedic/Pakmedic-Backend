// importing npm packages
const SibApiV3 = require("sib-api-v3-sdk");

// importing utils
const { mailConf } = require("../configs");

// configuring sib sdk
let client = SibApiV3.ApiClient.instance;
let apiKey = client.authentications["api-key"];

module.exports = async (recieverEmail, recieverName, htmlContent, subject) => {
  console.log(recieverEmail, recieverName, htmlContent, subject);
  apiKey.apiKey = mailConf.sibApiKey;
  let apiInstance = new SibApiV3.TransactionalEmailsApi();
  let sendSmtpEmail = new SibApiV3.SendSmtpEmail();
  sendSmtpEmail.sender = {
    name: mailConf.senderName,
    email: mailConf.senderEmail,
  };
  sendSmtpEmail.to = [{ email: recieverEmail, name: recieverName }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.replyTo = {
    name: mailConf.replyToName,
    email: mailConf.replyToEmail,
  };
  // sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
  //   sendSmtpEmail.params = {
  //     parameter: "My param value",
  //     subject: "New Subject",
  //   };
  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    },
    function (error) {
      console.error(error);
    }
  );
};
