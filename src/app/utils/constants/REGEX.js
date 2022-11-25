module.exports = {
  // Regex for string validation
  stringRegex: /^[a-zA-Z ]{2,30}$/,
  // Regex for number validation
  numberRegex: /^[0-9]$/,
  // Regex for alpha-numeric validation
  alphaNumericRegex: /^[a-zA-Z0-9]$/,
  // Regex for email validation
  emailRegex:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  // Regex for password validation
  passwordRegex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,
  // Regex for cnic validation
  cnicRegex: /^[0-9]{5}[-]{0,1}[0-9]{7}[-]{0,1}[0-9]{1}$/,
  // Regex for phone number validation
  phoneRegex: /^[0-9]{11}$/,
  // Regex for address validation
  addressRegex: /^[a-zA-Z0-9\s,]{2,30}$/,
  // Regex for city validation
  zipCodeRegex: /^[0-9]{5}$/,
  // Regex for date of birth validation
  dateOfBirthRegex: /^[0-9]{2}-[0-9]{2}-[0-9]{4}$/,
};
