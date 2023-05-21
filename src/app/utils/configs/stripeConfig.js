require('dotenv').config();


exports.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

exports.stripe_config = {
  apiVersion: "2022-11-15",
  typescript: false,
};
