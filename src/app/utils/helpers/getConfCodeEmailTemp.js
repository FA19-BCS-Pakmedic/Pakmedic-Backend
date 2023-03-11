const getVerificationEmailTemplate = (userId, userType) => {
  return `<html>
  <body style="font-family: Helvetica">
    <h1>Please Click on the link below to verify your account</h1>
    <a>localhost:8000/api/v1/${userType}/verify/${userId}</a>  
  </body>
</html>`;
};

const getConfirmationCodeTemplate = (code) => {
  return `<html>
  <body style="font-family: Helvetica">
    <h1>Confirmation Code</h1>
    <h2 style="color: #44886b">${code}</h2>
    <p>This code will expire in 10 minutes</p>
  </body>
</html>`;
};

module.exports = {
  getVerificationEmailTemplate,
  getConfirmationCodeTemplate,
};
