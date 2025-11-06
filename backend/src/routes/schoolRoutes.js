import { createSchool, listSchools, getSchool, updateSchool } from "../controllers/schoolController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import express from "express";

const router = express.Router();

router.get("/", listSchools);
router.get("/:id", getSchool);
router.post("/", authenticateToken, createSchool);
router.put("/:id", authenticateToken, updateSchool);

export default router;