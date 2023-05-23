const express = require("express");
const router = express.Router();

const {
  createCustomer,
  createPaymentMethod,
  payForService,
  getCustomer,
  refundPayment,
  getCustomerPayments,
  getPaymentsReceived,
} = require("../../controllers/api/stripeController");
const { verifyToken } = require("../../middlewares");

router.use(verifyToken);

router.post("/customers", createCustomer);
router.get("/customers/:id", getCustomer);
router.patch("/update-payment-method/:id", createPaymentMethod);
router.post("/create-payment-method/:id", createPaymentMethod);
router.post("/pay-for-service/:id", payForService);
router.get("/patient-payments/:id", getCustomerPayments);
router.post("/refund/:id", refundPayment);
router.get("/doctor-payments/:id", getPaymentsReceived);

module.exports = router;
