import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignDonations
} from "../controllers/campaignController.js";

const router = express.Router();

router.get("/", listCampaigns);
router.get("/:id", getCampaign);
router.post("/", authenticateToken, createCampaign);
router.put("/:id", authenticateToken, updateCampaign);
router.delete("/:id", authenticateToken, deleteCampaign);
router.get("/:id/donations", authenticateToken, getCampaignDonations);

export default router;