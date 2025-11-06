import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignDonations,
  getCampaignDonorCount
} from "../controllers/campaignController.js";

const router = express.Router();

router.get("/", listCampaigns);
router.get("/:id", getCampaign);
router.post("/", authenticateToken, createCampaign);
router.put("/:id", authenticateToken, updateCampaign);
router.delete("/:id", authenticateToken, deleteCampaign);
router.get("/:id/donations", authenticateToken, getCampaignDonations);
router.get('/:id/donor-count', authenticateToken, getCampaignDonorCount);

export default router;