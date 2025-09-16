// src/routes/userRoutes.js
import express from "express";
import { getMe, updateProfile, changePassword } from "../controllers/userController.js";

const router = express.Router();

// GET  /api/users/me       -> get my profile
router.get("/me", getMe);

// PUT  /api/users/me       -> update profile
router.put("/me", updateProfile);

// PUT  /api/users/password -> change password
router.put("/password", changePassword);

import { listUsers, getUser } from "../controllers/userController.js";


// new:
router.get("/", listUsers);
router.get("/:id", getUser);


export default router;
