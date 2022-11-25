const { Client } = require("@googlemaps/google-maps-services-js");

// importing config
const { mapsConf } = require("../configs");

const client = new Client({});

module.exports = async (address) => {
  const params = {
    address: address,
    key: mapsConf.googleMapsApiKey,
  };
  // return client
  //     .geocode({ params })
  //     .then((res) => {
  //     return res.data.results[0].geometry.location;
  //     }).catch((err) => {
  //     console.log(err);
  //     }
  //     );
  try {
    const res = await client.geocode({ params });
    console.log(res.data.results[0].geometry.location);
    return res.data.results[0].geometry.location;
  } catch (err) {
    console.log(err);
  }
};
