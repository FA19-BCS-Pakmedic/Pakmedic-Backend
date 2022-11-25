const bcrypt = require("bcrypt");

// method to match passwords
module.exports = async (encryption, storedEncryption) => {
  return await bcrypt.compare(encryption, storedEncryption);
};
