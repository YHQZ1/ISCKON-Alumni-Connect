import express from 'express';
import { 
  createPaymentOrder, 
  paymentWebhook, 
  getPaymentStatus  // ADD THIS IMPORT
} from '../controllers/paymentController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Create payment order - protected route
router.post('/create-order', authenticateToken, createPaymentOrder);

// Get payment status - public route (needed for callback)
router.get('/status/:orderId', getPaymentStatus); // ADD THIS LINE

// Webhook endpoint - no authentication (called by CashFree)
router.post('/webhook', paymentWebhook);

export default router;