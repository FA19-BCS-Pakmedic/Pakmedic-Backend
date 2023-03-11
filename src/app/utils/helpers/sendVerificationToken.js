// const crypto = require("crypto");

// module.exports = (user, res) => {
//     // create reset token and expiry
//   const resetPasswordToken =
//     crypto.randomBytes(20).toString("hex") + Date.now();
//   const resetPasswordExpiry = Date.now() + 600000; // 10 mins

//   // updating the patient data by adding token and expiry
//   const updatedPatient = await Patient.findOneAndUpdate(
//     { email },
//     { $set: { resetPasswordToken, resetPasswordExpiry } },
//     { new: true }
//   );
//   console.log(updatedPatient);
//   res.status(200).json({
//     success: true,
//     resetToken: resetPasswordToken,
//     message: `${tokenExpiry} 10mins`,
//   });
// }
