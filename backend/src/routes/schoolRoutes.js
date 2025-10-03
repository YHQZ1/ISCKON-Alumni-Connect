import { createSchool, listSchools, getSchool, updateSchool } from "../controllers/schoolController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import express from "express";

const router = express.Router();

// // POST /api/schools  -> create a school (protected by authenticateToken in server.js)
// router.post("/", createSchool);

// // GET /api/schools -> list (optional: can be public; currently protected by server.js config)
// router.get("/", listSchools);

// // GET /api/schools/:id -> get single school
// router.get("/:id", getSchool);

// // PUT /api/schools/:id -> update school (protected by authenticateToken in server.js)
// router.put("/:id", updateSchool);

// Public routes
router.get("/", listSchools);
router.get("/:id", getSchool);

// Protected routes
router.post("/", authenticateToken, createSchool);
router.put("/:id", authenticateToken, updateSchool);

export default router;