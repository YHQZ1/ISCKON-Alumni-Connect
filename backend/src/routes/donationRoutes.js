import express from 'express';
import { 
  createDonation, 
  webhookHandler,
  getMyDonationStats,
  getMyRecentDonations,
  getCampaignDonations
} from '../controllers/donationController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/', authenticateToken, createDonation);
router.post('/webhook', webhookHandler);
router.get('/my-stats', authenticateToken, getMyDonationStats);
router.get('/my-recent', authenticateToken, getMyRecentDonations);
router.get('/campaign/:campaignId', authenticateToken, getCampaignDonations);

export default router;