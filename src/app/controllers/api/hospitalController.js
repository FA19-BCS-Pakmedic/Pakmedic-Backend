// import utils
const { catchAsync, AppError } = require("../../utils/helpers");
const { noHospitalsFound } = require("../../utils/constants/RESPONSEMESSAGES");

// import model
const Hospital = require("../../models").hospital;
const Address = require("../../models").address;

// create hospital
exports.createHospital = catchAsync(async (req, res, next) => {
  req.body.image = req.file.filename;
  const { name, address, image } = req.body;

  const hospital = new Hospital({ name, address, image });

  await hospital.save();

  res.status(201).json({
    status: "success",
    data: {
      hospital,
    },
  });
});

//get all hospitals
exports.getAllHospitals = catchAsync(async (req, res, next) => {
  const hospitals = await Hospital.find().populate("address");
  if (!hospitals.length > 0) {
    return next(new AppError(noHospitalsFound, 404));
  }

  res.status(200).json({
    status: "success",
    results: hospitals.length,
    data: {
      hospitals,
    },
  });
});

// get hospital by id
exports.getHospitalById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  //   console.log(id);
  const hospital = await Hospital.findById(id).populate("address");
  if (!hospital) {
    return next(new AppError(noHospitalsFound, 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      hospital,
    },
  });
});

// update hospital
exports.updateHospital = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  const hospital = await Hospital.findOneAndUpdate(
    { _id: id },
    { $set: data },
    { new: true }
  );
  if (!hospital) {
    return next(new AppError(noHospitalsFound, 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      hospital,
    },
  });
});

//delete hospital
exports.deleteHospital = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  // const hospital = await Hospital.findByIdAndDelete(id);
  const hospital = await Hospital.findById(id);

  // check if there is no hospital with that id
  if (!hospital) {
    return next(new AppError(noHospitalsFound, 404));
  }

  // fetch the address reference id
  const addressId = hospital.address;

  // delete address associated with the hospital
  await Address.findByIdAndDelete(addressId);

  // delete hospital
  await hospital.remove();

  // return response
  res.status(204).json({
    status: "success",
    data: null,
  });
});
