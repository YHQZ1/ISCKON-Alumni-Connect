import express from 'express';
import { 
  createPaymentOrder, 
  paymentWebhook, 
  getPaymentStatus
} from '../controllers/paymentController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/create-order', authenticateToken, createPaymentOrder);
router.get('/status/:orderId', getPaymentStatus);
router.post('/webhook', paymentWebhook);

export default router;