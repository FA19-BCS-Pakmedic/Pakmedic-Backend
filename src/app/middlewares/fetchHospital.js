// import utils
const { catchAsync } = require("../utils/helpers");

// import address model
const Hospital = require("../models").hospital;

// create hospital
module.exports = catchAsync(async (req, res, next) => {
  const hospitalId = req.body?.hospitalId;
  req.body.image = req.file.filename;
  const { name, address, image } = req.body;
  let isUpdated = false;

  if (hospitalId)
    isUpdated = await updateHospital(hospitalId, name, address, image, req);

    
  if (!isUpdated) {
    console.log("creating new address");
    const hospital = new Hospital({ name, address, image });

    const data = await hospital.save();

    //   saving the returned object from mongodb in body
    req.body.hospital = data._id;
  }

  next();
});

// update hospital if its a patch method
const updateHospital = async (id, name, address, image, req) => {
  const storedHospital = await Hospital.findById(id);
  if (storedHospital) {
    console.log("updating hospital");
    storedHospital.name = name;
    storedHospital.address = address;
    storedHospital.image = image;
    const data = await storedHospital.save();
    req.body.hospital = data._id;
    return true;
  }

  return false;
};
