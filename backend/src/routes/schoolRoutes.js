// src/routes/schoolRoutes.js
import express from "express";
import { createSchool, listSchools, getSchool } from "../controllers/schoolController.js";

const router = express.Router();

// POST /api/schools  -> create a school (protected by authenticateToken in server.js)
router.post("/", createSchool);

// GET /api/schools -> list (optional: can be public; currently protected by server.js config)
router.get("/", listSchools);

// GET /api/schools/:id -> get single school
router.get("/:id", getSchool);

export default router;
