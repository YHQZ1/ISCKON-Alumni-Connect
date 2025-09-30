// src/routes/donationRoutes.js
import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import { createDonation, webhookHandler } from "../controllers/donationController.js";

const router = express.Router();

// Create donation (protected: remove auth for guest donations)
router.post("/", authenticateToken, createDonation);

// Webhook -> unprotected but must verify signatures in handler
router.post("/webhook", webhookHandler);

export default router;
