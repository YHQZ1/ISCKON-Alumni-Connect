// src/routes/campaignRoutes.js
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

// Public reads
router.get("/", listCampaigns);
router.get("/:id", getCampaign);

// Protected actions
router.post("/", authenticateToken, createCampaign);
router.put("/:id", authenticateToken, updateCampaign);
router.delete("/:id", authenticateToken, deleteCampaign);

// campaign donations (owner only)
router.get("/:id/donations", authenticateToken, getCampaignDonations);

export default router;
