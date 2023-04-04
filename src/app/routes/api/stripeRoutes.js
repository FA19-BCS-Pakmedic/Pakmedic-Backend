const express = require("express");
const router = express.Router();

const {
  createCustomer,
  createPaymentMethod,
  payForService,
  getAllInvoices,
  getCustomer,
} = require("../../controllers/api/stripeController");
const { verifyToken } = require("../../middlewares");

router.use(verifyToken);

router.post("/customers", createCustomer);
router.get("/customers/:id", getCustomer);

router.patch("/update-payment-method/:id", createPaymentMethod);
router.post("/create-payment-method", createPaymentMethod);
router.post("/pay-for-service/:id", payForService);
router.get("/invoices", getAllInvoices);

module.exports = router;
