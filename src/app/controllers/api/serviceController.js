const { AppError, catchAsync, deleteFile } = require("../../utils/helpers");
const {
  noServiceFound,
  noDoctorsFound,
} = require("../../utils/constants/RESPONSEMESSAGES");

// importing models
const Service = require("../../models").service;
const Hospital = require("../../models").hospital;
const Address = require("../../models").address;
const Doctor = require("../../models").doctor;

// add service
exports.addService = catchAsync(async (req, res, next) => {
  console.log("HERE IN ADD SERVICE FUNCTION");

  const doctorID = req.user._id;

  const { hospital, fee, days, availFrom, availTo, isOnline } = req.body;

  const service = new Service({
    hospital,
    fee,
    days,
    availFrom,
    availTo,
    isOnline,
  });

  const data = await service.save();

  // save the key from saved experience to the doctor document
  const doctor = await Doctor.findByIdAndUpdate(
    doctorID,
    {
      $push: { services: data._id },
    },
    { new: true }
  );

  console.log(doctor);

  res.status(200).json({
    status: "success",
    data: {
      service,
      user: doctor,
    },
  });
});

// get all services
exports.getAllServices = catchAsync(async (req, res, next) => {
  //   getting all the service documents and populating the hospital fields
  let services = await Service.find().populate({
    path: "hospital",
    populate: { path: "address", model: "Address" },
  });

  //   if no services found
  if (!services.length) {
    return next(new AppError(noServiceFound, 404));
  }

  res.status(200).json({
    status: "success",
    results: services.length,
    data: {
      services,
    },
  });
});

// get a specific service by Id
exports.getServiceById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const service = await Service.findById(id).populate({
    path: "hospital",
    populate: { path: "address", model: "Address" },
  });

  if (!service) {
    return next(new AppError(noExpFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      service,
    },
  });
});

// get a single doctor services
exports.getSpecificDoctorServices = catchAsync(async (req, res, next) => {
  const docid = req.params.id;

  const doctor = await Doctor.findById(docid)
    .select({ name: 1, services: 1 })
    .populate({
      path: "services",
      model: "Service",
      populate: {
        path: "hospital",
        model: "Hospital",
        populate: { path: "address", model: "Address" },
      },
    });

  console.log(doctor);

  if (!doctor) {
    return next(new AppError(noDoctorsFound, 404));
  }

  const services = doctor.services;

  console.log(services);

  res.status(200).json({
    status: "success",
    results: services.length,
    data: {
      services,
    },
  });
});

//update service
exports.updateService = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  const doctorID = req.user._id;
  const service = await Service.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  );
  if (!service) {
    return next(new AppError(noExpFound, 404));
  }

  const doctor = await Doctor.findById(doctorID);
  // service.title = title;
  // service.hospital = hospital;
  // await service.save();
  res.status(200).json({
    status: "success",
    data: {
      service,
      user: doctor,
    },
  });
});

// delete service
exports.deleteService = catchAsync(async (req, res, next) => {
  console.log("HERE IN DELETE SERVICE FUNCTION");
  const id = req.params.id;
  const docId = req.user._id;
  const service = await Service.findById(id);

  console.log(service);

  if (!service) {
    return next(new AppError(noServiceFound, 404));
  }

  const hospitalID = service?.hospital?._id;
  const addressID = service?.hospital?.address?._id;

  console.log(service);

  // remove the experience from the array of doctor document
  const doctor = await Doctor.findByIdAndUpdate(
    docId,
    {
      $pull: { services: service._id },
    },
    {
      new: true,
    }
  );

  // fetch hospital
  if (hospitalID) {
    const hospital = await Hospital.findById(hospitalID);

    // delete the image of hospital
    if (hospital.image) deleteFile(hospital.image, "images");

    // delete the hospital
    hospital.remove();
  }

  // remove address
  if (addressID) await Address.findByIdAndDelete(addressID);

  // remove service
  await service.remove();

  // add delete file functionality aswell !!!!!!!!!!!!!!!!!

  res.status(200).json({
    status: "success",
    data: {
      user: doctor,
    },
  });
});
