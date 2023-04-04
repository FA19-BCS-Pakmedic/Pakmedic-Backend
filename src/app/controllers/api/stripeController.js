const { stripe, catchAsync, AppError } = require("../../utils/helpers");

const { patient } = require("../../models");

// import {} from "../../utils/constants/RESPONSEMESSAGES";

exports.createCustomer = catchAsync(async (req, res) => {
  const { payment_method } = req.body;

  const { name, email, id } = req.user;

  const createdCustomer = await stripe.stripeClient.customers.create({
    name,
    email,
    payment_method: payment_method,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });

  if (!createdCustomer) {
    return next(new AppError("Customer not created", 400));
  }

  await patient.findByIdAndUpdate(
    id,
    {
      $set: { stripeCustomerId: createdCustomer.id },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      customer: createdCustomer,
    },
  });
});

exports.createPaymentMethod = catchAsync(async (req, res) => {
  const { number, exp_month, exp_year, cvc } = req.body;
  const { id } = req.params;

  console.log(id);

  const data = {
    body: {
      type: "card",
      card: {
        number,
        exp_month,
        exp_year,
        cvc,
      },
    },
  };

  let paymentMethod = await stripe.stripeClient.paymentMethods.create(
    data.body
  );

  if (id) {
    // attach the payment method to the customer
    paymentMethod = await stripe.stripeClient.paymentMethods.attach(
      paymentMethod.id,
      {
        customer: id,
      }
    );

    //update the customer with the payment method
    await stripe.stripeClient.customers.update(id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });
  }

  res.json({
    message: "Card created",
    status: 201,
    data: {
      paymentMethod,
    },
  });
});

exports.getCustomer = catchAsync(async (req, res) => {
  const { id } = req.params;

  // get customer from stripe along with their payment method

  const customer = await stripe.stripeClient.customers.retrieve(id);

  const paymentMethod = await stripe.stripeClient.paymentMethods.retrieve(
    customer.invoice_settings.default_payment_method
  );

  if (!customer) return next(new AppError("No customer found", 400));

  res.status(200).json({
    status: "success",
    data: {
      customer,
      paymentMethod,
    },
  });
});

exports.getAllInvoices = catchAsync(async (req, res) => {
  const { id } = req.params;

  const invoices = await stripe.stripeClient.invoices.list({
    customer: id,
  });

  if (!invoices) return next(new AppError("No invoices found", 400));

  res.status(200).json({
    status: "success",
    data: {
      invoices,
    },
  });
});

exports.payForService = catchAsync(async (req, res) => {
  const { customerId, price } = req.body;

  const paymentIntent = await stripe.stripeClient.paymentIntents.create({
    amount: price,
    currency: "usd",
    customer: customerId,
    payment_method_types: ["card"],
  });

  if (!paymentIntent) {
    return next(new AppError("Payment not successful", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      paymentIntent,
    },
  });
});
