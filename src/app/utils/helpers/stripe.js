const stripe = require("stripe");

const { stripeConf } = require("../configs");

const { STRIPE_SECRET_KEY, stripe_config } = stripeConf;

exports.stripeClient = stripe(STRIPE_SECRET_KEY, stripe_config);
