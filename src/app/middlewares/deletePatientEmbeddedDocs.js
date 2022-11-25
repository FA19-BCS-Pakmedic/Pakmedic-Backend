// import utils
const { userNotFound } = require("../utils/constants/RESPONSEMESSAGES");
const { AppError, catchAsync, deleteFile } = require("../utils/helpers");

// importing models
const Family = require("../models").family;
const Report = require("../models").report;
const Scan = require("../models").scan;
const Patient = require("../models").patient;

module.exports = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;

  const patient = await Patient.findById(id)
    .populate({ path: "reports", model: "Report" })
    .populate({ path: "scans", model: "Scan" })
    .populate({
      path: "familyMembers",
      model: "Family",
      populate: {
        path: "reports",
        model: "Report",
      },
      populate: {
        path: "scans",
        model: "Scan",
      },
    });

  if (!patient) {
    return next(new AppError(`Patient ${userNotFound}`, 404));
  }

  // delete patient's reports
  if (patient.reports.length > 0) {
    patient.reports.forEach(async (report) => {
      deleteFile(report.image, "images");
      await Report.findByIdAndDelete(report._id);
    });
  }

  //delete patients's scans
  if (patient.scans.length > 0) {
    patient.scans.forEach(async (scan) => {
      deleteFile(scan.image, "images");
    });
  }

  //   delete the family members along with all the embedded documents;
  if (patient.familyMembers.length > 0) {
    patient.familyMembers.forEach(async (member) => {
      if (member.reports.length > 0) {
        member.reports.forEach(async (report) => {
          deleteFile(report.image, "images");
          await Report.findByIdAndDelete(report._id);
        });
      }
      if (member.scans.length > 0) {
        member.scans.forEach(async (scan) => {
          deleteFile(scan.image, "images");
          await Scan.findByIdAndDelete(scan._id);
        });
      }
      await Family.findByIdAndDelete(member._id);
    });
  }

  next();
});

// function will work for both experience and service model
// const removeEmbeddedFields = async (data) => {
//   try {
//     data.forEach(async (item) => {
//       // delete the image of the hospital
//     //   deleteFile(item.hospital.image, "images");

//       const hospitalId = item.hospital._id;
//       const addressId = item.hospital.address;

//       // delete the address of the hospital
//       await Address.findByIdAndDelete(addressId);

//       // delete the hospital
//       await Hospital.findByIdAndDelete(hospitalId);

//       // delete the experience
//       await item.remove();
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };
