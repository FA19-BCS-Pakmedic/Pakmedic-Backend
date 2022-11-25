// import npm packages

// import models
const Patient = require("../../models").patient;
const Family = require("../../models").family;
const Report = require("../../models").report;

// import utils
const { catchAsync, AppError, deleteFile } = require("../../utils/helpers");
const {
  userNotFound,
  successfullyAdded,
  successfullyUpdated,
  successfullyDeleted,
  noReportsFound,
} = require("../../utils/constants/RESPONSEMESSAGES");
const patientRegisterValidator = require("../../middlewares/patientRegisterValidator");

// create report
exports.createReport = catchAsync(async (req, res, next) => {
  //   check if the report is for the family member of the patient
  let isFamilyReport = req.body?.isFamilyReport;
  isFamilyReport = isFamilyReport === "true";

  //   extract the saved file name from req and store it in the body
  req.body.image = req.file.filename;

  //   extract the data from the body
  const { title, date, symptoms, lab, image } = req.body;

  //   create a report object
  const report = new Report({
    title,
    date,
    symptoms,
    lab,
    image,
    isFamilyReport,
  });

  //   store the report object
  await report.save();

  //   if the report is for the family member
  if (isFamilyReport) {
    // extract the family member id
    const familyId = req.body.familyId;

    //   find the family member based on id
    const family = await Family.findById(familyId);

    //  if family member doesn't exist
    if (!family) {
      return next(new AppError(`Family member ${userNotFound}`, 404));
    }

    //   push the object id of the saved report to the family member document
    family.reports.push(report._id);

    await family.save();
  }
  // if it is not a report of the family member then push the report to the patient document
  else {
    //get the logged in patient id
    const id = req.decoded.id;

    //   find the patient based on id
    const patient = await Patient.findById(id);

    //   if patient doesn't exist
    if (!patient) {
      return next(new AppError(`Patient ${userNotFound}`, 404));
    }

    //   push the object id of the saved report to the patient document
    patient.reports.push(report._id);

    await patient.save();
  }

  res.status(201).json({
    status: "success",
    message: `Report ${successfullyAdded}`,
    data: {
      report,
    },
  });
});

// get report by id
exports.getReportById = catchAsync(async (req, res, next) => {
  // get the report id
  const id = req.params.id;

  // find the report
  const report = await Report.findById(id);

  // if report doesn't exist
  if (!report) {
    return next(new AppError(noReportsFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      report,
    },
  });
});

// get reports by patient id
exports.getReportsByPatientId = catchAsync(async (req, res, next) => {
  // get the patient id
  const id = req.decoded?.id || req.params?.id;

  // find the patient
  const patient = await Patient.findById(id)
    .populate("reports")
    .populate({
      path: "familyMembers",
      model: "Family",
      populate: { path: "reports", model: "Report" },
    });

  // if patient doesn't exist
  if (!patient) {
    return next(new AppError(`Patient ${userNotFound}`, 404));
  }

  //  extract the family reports from the embedded family documents
  const familyReports = patient.familyMembers.map((family) => {
    return family.reports;
  });

  //  flatten the array
  const reports = patient.reports.concat(...familyReports);

  if (!reports.length > 0) {
    return next(new AppError(noReportsFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      reports,
    },
  });
});

// !!!!!!!!!!!!!!!!!!!!!!!!!! THIS METHOD WILL BE REMOVED SINCE IT IS NOT NEEDED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.getReportsOfAllFamilyMembers = catchAsync(async (req, res, next) => {
  // get the patient id
  const id = req.decoded?.id || req.params?.id;

  // find the patient
  const patient = await Patient.findById(id).populate({
    path: "familyMembers",
    model: "Family",
    populate: {
      path: "reports",
      model: "Report",
    },
  });

  // if patient doesn't exist
  if (!patient) {
    return next(new AppError(`Patient ${userNotFound}`, 404));
  }

  const reports = patient.familyMembers.map((familyMember) => {
    return familyMember.reports;
  });

  if (!reports.length > 0) {
    return next(new AppError(noReportsFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      reports,
    },
  });
});

// get reports by family member id
exports.getReportsByFamilyId = catchAsync(async (req, res, next) => {
  // get the family member id
  const id = req.params.id;

  // find the family member
  const family = await Family.findById(id).populate("reports");

  // if family member doesn't exist
  if (!family) {
    return next(new AppError(`Family member ${userNotFound}`, 404));
  }

  const reports = family.reports;

  if (!reports.length > 0) {
    return next(new AppError(noReportsFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      reports,
    },
  });
});

// update report data
exports.updateReport = catchAsync(async (req, res, next) => {
  //get report id
  const id = req.params.id;

  const data = req.body;

  //find the report
  const report = await Report.findByIdAndUpdate(
    id,
    {
      $set: data,
    },
    {
      new: true,
    }
  );

  //if report doesn't exist
  if (!report) {
    return next(new AppError(`Report ${userNotFound}`, 404));
  }

  res.status(200).json({
    status: "success",
    message: `Report ${successfullyUpdated}`,
    data: {
      report,
    },
  });
});

//selective file update out of the multiple files issue#43

// delete the report along with its id in the patient's collection and in the family member's collection
exports.deleteReport = catchAsync(async (req, res, next) => {
  // get patient id
  const id = req.decoded.id;

  // get report id
  const reportId = req.params.id;

  // find the report
  const report = await Report.findById(reportId);

  // if report doesn't exist
  if (!report) {
    return next(new AppError(`Report ${userNotFound}`, 404));
  }

  //   delete the relative report file !!!! this function will be replaced by multiple files deletion function
  deleteFile(report.image, "images");

  //delete the report
  await report.remove();

  // if the report is for the family member
  if (report.isFamilyReport) {
    // find the patient
    const patient = await Patient.findById(id);

    // if patient doesn't exist
    if (!patient) {
      return next(new AppError(`Patient ${userNotFound}`, 404));
    }

    // fetch the family member array
    const familyMembers = patient.familyMembers;

    // find the family members and remove the report id if it is in the reports array
    familyMembers.map(async (familyId) => {
      await Family.findByIdAndUpdate(familyId, {
        $pull: { reports: reportId },
      });
    });
  }
  // if the report is for the patient
  else {
    // find the patient and remove the report id from the patient document
    await Patient.findByIdAndUpdate(id, {
      $pull: { reports: reportId },
    });
  }

  res.status(200).json({
    status: "success",
    message: `Report ${successfullyDeleted}`,
  });
});
