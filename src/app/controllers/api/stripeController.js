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
  const customerId = req.params.id;
  const { price, metadata } = req.body;

  const customer = await stripe.stripeClient.customers.retrieve(customerId);
  const defaultPaymentMethod = customer.invoice_settings.default_payment_method;

  const paymentIntent = await stripe.stripeClient.paymentIntents.create({
    amount: price * 100,
    currency: "pkr",
    customer: customerId,
    payment_method: defaultPaymentMethod,
    payment_method_types: ["card"],
    metadata,
    off_session: true,
    confirm: true,
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

exports.refundPayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const refund = await stripe.stripeClient.refunds.create({
    payment_intent: id,
    amount: amount * 100, // amount to be refunded, in cents
  });

  res.status(200).json({
    status: "success",
    data: {
      refund,
    },
  });
});

exports.getCustomerPayments = catchAsync(async (req, res) => {
  const { id } = req.params;

  const payments = await stripe.stripeClient.paymentIntents.list({
    customer: id,
  });

  res.status(200).json({
    status: "success",
    data: {
      payments: payments.data,
    },
  });
});

exports.getPaymentsReceived = catchAsync(async (req, res) => {
  const { id } = req.params;

  // expand the customer field
  let payments = await stripe.stripeClient.paymentIntents.list({
    limit: 100,
    expand: ["data.customer"],
  });



  // get all the payments with metadata.doctorId === id
  payments = payments.data.filter(
    (payment) => payment.metadata.doctorId === id
  );

   //calculate total earnings for the current month
   const currentMonth = new Date().getMonth();

  //calculate total earnings
  const totalEarnings = payments.reduce((acc, payment) => {
    return acc + payment.amount;
  }, 0);

  //calculate average earnings by month
  const averageEarnings = totalEarnings / currentMonth;


  currentMonthPayments = payments.filter((payment) => {
    const paymentMonth = new Date(payment.created * 1000).getMonth();
    return paymentMonth === currentMonth;
  });

  const currentMonthEarnings = currentMonthPayments.reduce((acc, payment) => {
    return acc + payment.amount;
  }, 0);

  return res.status(200).json({
    status: "success",
    data: {
      payments: payments,
      totalEarnings: totalEarnings/100,
      averageEarnings: averageEarnings/100,
      currentMonthEarnings: currentMonthEarnings/100,
    },
  });
});
