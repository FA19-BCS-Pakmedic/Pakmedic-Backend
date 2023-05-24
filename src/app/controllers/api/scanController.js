// import npm packages

// import models
const Patient = require("../../models").patient;
const Family = require("../../models").family;
const Scan = require("../../models").scan;

// import utils
const { catchAsync, AppError, deleteFile } = require("../../utils/helpers");
const {
  userNotFound,
  successfullyAdded,
  successfullyUpdated,
  successfullyDeleted,
  noScansFound,
  databaseConnected,
} = require("../../utils/constants/RESPONSEMESSAGES");

// create scan
exports.createScan = catchAsync(async (req, res, next) => {
  console.log(req.file);

  //   check if the scan is for the family member of the patient
  let isFamilyScan = req.body?.isFamilyScan;

  //   if(req.file){
  //   //   extract the saved file name from req and store it in the body
  //   req.body.image = req.file.filename;
  // }

  //   separate familyMemberId from the rest of data
  const { familyMemberId, ...data } = req.body;

  console.log(req.body);

  //   create a scan object
  const scan = new Scan(data);

  if (data.isFamilyScan) {
    scan.familyMemberId = familyMemberId;
  }
  //   store the scan object
  await scan.save();

  //   if the scan is for the family member
  if (isFamilyScan) {
    // extract the family member id
    const familyId = familyMemberId;

    //   find the family member based on id
    const family = await Family.findById(familyId);

    //  if family member doesn't exist
    if (!family) {
      return next(new AppError(`Family member ${userNotFound}`, 404));
    }

    //   push the object id of the saved scan to the family member document
    family.scans.push(scan._id);

    await family.save();
  }
  // if it is not a scan of the family member then push the scan to the patient document
  else {
    //get the logged in patient id
    const id = req.user._id;

    //   find the patient based on id
    const patient = await Patient.findById(id);

    //   if patient doesn't exist
    if (!patient) {
      return next(new AppError(`Patient ${userNotFound}`, 404));
    }

    //   push the object id of the saved scan to the patient document
    patient.scans.push(scan._id);

    await patient.save();
  }

  res.status(201).json({
    status: "success",
    message: `Scan ${successfullyAdded}`,
    data: {
      scan,
    },
  });
});

// get scan by id
exports.getScanById = catchAsync(async (req, res, next) => {
  // get the scan id
  const id = req.params.id;

  // find the scan
  const scan = await Scan.findById(id);

  // if scan doesn't exist
  if (!scan) {
    return next(new AppError(noScansFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      scan,
    },
  });
});

// get scans by patient id
exports.getScansByPatientId = catchAsync(async (req, res, next) => {
  // get the patient id
  const id = req.decoded?.id || req.params?.id;
  const type = req?.query?.type;

  // find the patient
  const patient = await Patient.findById(id)
    .populate("scans")
    .populate({
      path: "familyMembers",
      model: "Family",
      populate: { path: "scans", model: "Scan" },
    });

  // if patient doesn't exist
  if (!patient) {
    return next(new AppError(`Patient ${userNotFound}`, 404));
  }

  //  extract the family scans from the embedded family documents
  const familyScans = patient.familyMembers.map((family) => {
    return family.scans;
  });

  //  flatten the array
  const scans = patient.scans.concat(...familyScans);

  // filter scans based on the "mri" query parameter
  const filteredScans =
    type === "xray"
      ? scans.filter((scan) => !scan.image.endsWith(".nii.gz"))
      : type === "mri"
      ? scans.filter((scan) => scan.image.endsWith(".nii.gz"))
      : scans;

  if (!filteredScans.length > 0) {
    return next(new AppError(noScansFound, 404));
  }

  if (!scans.length > 0) {
    return next(new AppError(noScansFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      scans: filteredScans,
    },
  });
});

// !!!!!!!!!!!!!!!!!!!!!!!!!! THIS METHOD WILL BE REMOVED SINCE IT IS NOT NEEDED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.getScansOfAllFamilyMembers = catchAsync(async (req, res, next) => {
  // get the patient id
  const id = req.decoded?.id || req.params?.id;

  // find the patient
  const patient = await Patient.findById(id).populate({
    path: "familyMembers",
    model: "Family",
    populate: {
      path: "scans",
      model: "Scan",
    },
  });

  // if patient doesn't exist
  if (!patient) {
    return next(new AppError(`Patient ${userNotFound}`, 404));
  }

  const scans = patient.familyMembers.map((familyMember) => {
    return familyMember.scans;
  });

  if (!scans.length > 0) {
    return next(new AppError(noScansFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      scans,
    },
  });
});

// get scans by family member id
exports.getScansByFamilyId = catchAsync(async (req, res, next) => {
  // get the family member id
  const id = req.params.id;

  // find the family member
  const family = await Family.findById(id).populate("scans");

  // if family member doesn't exist
  if (!family) {
    return next(new AppError(`Family member ${userNotFound}`, 404));
  }

  const scans = family.scans;

  if (!scans.length > 0) {
    return next(new AppError(noScansFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      scans,
    },
  });
});

// update scan data
exports.updateScan = catchAsync(async (req, res, next) => {
  //get scan id
  const id = req.params.id;

  let { familyMemberId, ...data } = req.body;

  if (data.isFamilyScan) {
    data.familyMemberId = familyMemberId;
  }

  //find the scan
  const scan = await Scan.findByIdAndUpdate(
    id,
    {
      $set: data,
    },
    {
      new: true,
    }
  );

  //if scan doesn't exist
  if (!scan) {
    return next(new AppError(`Scan ${userNotFound}`, 404));
  }

  res.status(200).json({
    status: "success",
    message: `Scan ${successfullyUpdated}`,
    data: {
      scan,
    },
  });
});

//selective file update out of the multiple files issue#43

// delete the scan along with its id in the patient's collection and in the family member's collection
exports.deleteScan = catchAsync(async (req, res, next) => {
  // get patient id
  const id = req.user._id;

  // get scan id
  const scanId = req.params.id;

  // find the scan
  const scan = await Scan.findById(scanId);

  // if scan doesn't exist
  if (!scan) {
    return next(new AppError(`Scan ${userNotFound}`, 404));
  }

  //   delete the relative scan file !!!! this function will be replaced by multiple files deletion function
  // deleteFile(scan.image, "images");

  //delete the scan
  await scan.remove();

  // if the scan is for the family member
  if (scan.isFamilyScan) {
    // find the patient
    const patient = await Patient.findById(id);

    // if patient doesn't exist
    if (!patient) {
      return next(new AppError(`Patient ${userNotFound}`, 404));
    }

    // fetch the family member array
    const familyMembers = patient.familyMembers;

    // find the family members and remove the scan id if it is in the scans array
    familyMembers.map(async (familyId) => {
      await Family.findByIdAndUpdate(familyId, {
        $pull: { scans: scanId },
      });
    });
  }
  // if the scan is for the patient
  else {
    // find the patient and remove the scan id from the patient document
    await Patient.findByIdAndUpdate(id, {
      $pull: { scans: scanId },
    });
  }

  res.status(200).json({
    status: "success",
    message: `Scan ${successfullyDeleted}`,
  });
});
