import express from "express";
import { 
  createPaymentOrder, 
  verifyPayment, 
  paymentWebhook 
} from "../controllers/paymentController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

// Create payment order (protected)
router.post("/orders", authenticateToken, createPaymentOrder);

// Verify payment status (protected)
router.post("/verify", authenticateToken, verifyPayment);

// Webhook (unprotected but secured with signature verification)
router.post("/webhook", paymentWebhook);

export default router;