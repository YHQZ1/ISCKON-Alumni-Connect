import express from "express";
import { getMe, updateProfile, changePassword, listUsers, getUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", getMe);
router.put("/me", updateProfile);
router.put("/password", changePassword);
router.get("/", listUsers);
router.get("/:id", getUser);

export default router;