// import utils
const { catchAsync, AppError, fetchGeocode } = require("../utils/helpers");

// import address model
const Address = require("../models").address;

module.exports = catchAsync(async (req, res, next) => {
  const addressId = req.body?.addressId;
  const { address, city } = req.body;
  const state = req.body?.state || "";
  let isUpdated = false;

  if (addressId)
    isUpdated = await updateAddress(addressId, address, city, state, req);

  if (!isUpdated) {
    console.log("creating new address");

    // fetching latitude and and longitude coordinates of the address
    const { lat, lng } = await fetchGeocode(`${address}, ${city}, ${state}`);

    // creating new address object
    const newAddress = new Address({
      address,
      city,
      state,
      lat,
      lng,
    });

    // saving new address object to the database
    const data = await newAddress.save();
    console.log(data);

    //   saving the returned object from mongodb in body
    req.body.address = data._id;
  }
  next();
});

// update address if its a patch method
const updateAddress = async (id, address, city, state, req) => {
  const storedAddress = await Address.findById(id);
  if (storedAddress) {
    if (
      storedAddress.address === address &&
      storedAddress.city === city &&
      storedAddress.state === state
    ) {
      console.log("not updating, address is the same");
      req.body.address = storedAddress._id;
      return true;
    }
    // fetching latitude and and longitude coordinates of the address
    const { lat, lng } = await fetchGeocode(`${address}, ${city}, ${state}`);

    storedAddress.address = address;
    storedAddress.city = city;
    storedAddress.state = state;
    storedAddress.lat = lat;
    storedAddress.lng = lng;

    console.log("updating address");
    const data = await storedAddress.save();
    req.body.address = data._id;
    return true;
  }
  return false;
};
