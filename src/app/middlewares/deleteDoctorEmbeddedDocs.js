// import utils
const { userNotFound } = require("../utils/constants/RESPONSEMESSAGES");
const { AppError, catchAsync, deleteFile } = require("../utils/helpers");

// importing models
const Service = require("../models").service;
const Experience = require("../models").experience;
const Hospital = require("../models").hospital;
const Address = require("../models").address;
const Doctor = require("../models").doctor;

module.exports = catchAsync(async (req, res, next) => {
  const id = req.decoded.id;

  const doctor = await Doctor.findById(id)
    .populate({
      path: "experiences",
      model: "Experience",
      populate: {
        path: "hospital",
        model: "Hospital",
      },
    })
    .populate({
      path: "services",
      model: "Service",
      populate: {
        path: "hospital",
        model: "Hospital",
      },
    });

  if (!doctor) {
    return next(new AppError(`Doctor ${userNotFound}`, 404));
  }

  // delete the doctor's experiences
  const experiences = doctor.experiences;
  const services = doctor.services;

  if (experiences.length > 0) await removeEmbeddedFields(experiences);
  if (services.length > 0) await removeEmbeddedFields(services);

  next();
});

// function will work for both experience and service model
const removeEmbeddedFields = async (data) => {
  try {
    data.forEach(async (item) => {
      // delete the image of the hospital
      deleteFile(item.hospital.image, "images");

      const hospitalId = item.hospital._id;
      const addressId = item.hospital.address;

      // delete the address of the hospital
      await Address.findByIdAndDelete(addressId);

      // delete the hospital
      await Hospital.findByIdAndDelete(hospitalId);

      // delete the experience
      await item.remove();
    });
  } catch (err) {
    console.log(err);
  }
};
