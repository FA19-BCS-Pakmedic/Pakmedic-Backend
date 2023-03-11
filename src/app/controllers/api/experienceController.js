// importing utils
const { AppError, catchAsync, deleteFile } = require("../../utils/helpers");
const {
  noExpFound,
  noDoctorsFound,
} = require("../../utils/constants/RESPONSEMESSAGES");

// importing models
const Experience = require("../../models").experience;
const Hospital = require("../../models").hospital;
const Address = require("../../models").address;
const Doctor = require("../../models").doctor;

// add experience
exports.addExperience = catchAsync(async (req, res, next) => {
  const doctorID = req.user._id;

  console.log(doctorID, req.body);

  // console.log(req.decoded);
  const { title, hospital, from, to } = req.body;

  const experience = new Experience({ title, hospital, from, to });

  const data = await experience.save();

  // save the key from saved experience to the doctor document
  const doctor = await Doctor.findByIdAndUpdate(
    doctorID,
    {
      $push: { experiences: data._id },
    },
    { new: true }
  );

  // console.log(doctor);

  res.status(200).json({
    status: "success",
    data: {
      experience,
      user: doctor,
    },
  });
});

// get all experiences
exports.getAllExperiences = catchAsync(async (req, res, next) => {
  //   getting all the experiences documents and populating the hospital fields
  let experiences = await Experience.find().populate({
    path: "hospital",
    populate: { path: "address", model: "Address" },
  });

  //   if no experiences found
  if (!experiences.length) {
    return next(new AppError(noExpFound, 404));
  }

  res.status(200).json({
    status: "success",
    results: experiences.length,
    data: {
      experiences,
    },
  });
});

// get a single doctor experiences
exports.getSpecificDoctorExperiences = catchAsync(async (req, res, next) => {
  const docid = req.params.id;

  const doctor = await Doctor.findById(docid)
    .select({ name: 1, experiences: 1 })
    .populate({
      path: "experiences",
      model: "Experience",
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

  const experiences = doctor.experiences;

  console.log(experiences);

  res.status(200).json({
    status: "success",
    results: experiences.length,
    data: {
      experiences,
    },
  });
});

// get experience by id
exports.getExperienceById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const experience = await Experience.findById(id).populate({
    path: "hospital",
    populate: { path: "address", model: "Address" },
  });

  if (!experience) {
    return next(new AppError(noExpFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      experience,
    },
  });
});

//update experience
exports.updateExperience = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const data = req.body;

  const doctorID = req.user._id;
  const experience = await Experience.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  );

  if (!experience) {
    return next(new AppError(noExpFound, 404));
  }
  // experience.title = title;
  // experience.hospital = hospital;
  // await experience.save();

  const doctor = await Doctor.findById(doctorID);

  res.status(200).json({
    status: "success",
    data: {
      experience,
      user: doctor,
    },
  });
});

// delete experience
exports.deleteExperience = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const docId = req.user._id;
  const experience = await Experience.findById(id);

  if (!experience) {
    return next(new AppError(noExpFound, 404));
  }

  const hospitalID = experience?.hospital?._id;
  const addressID = experience?.hospital?.address?._id;

  console.log(experience);

  // remove the experience from the array of doctor document
  const doctor = await Doctor.findByIdAndUpdate(
    docId,
    {
      $pull: { experiences: experience._id },
    },
    { new: true }
  );

  if (hospitalID) {
    // fetch hospital
    const hospital = await Hospital.findById(hospitalID);

    // delete the image of hospital
    deleteFile(hospital.image, "images");

    // delete hospital
    await hospital.remove();
  }

  // remove address
  if (addressID) await Address.findByIdAndDelete(addressID);

  // remove experience
  await experience.remove();

  if (!experience) {
    return next(new AppError(noExpFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: doctor,
    },
  });
});
