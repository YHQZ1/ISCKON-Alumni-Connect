// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./src/routes/authRoutes.js"    // signup/login (public)
import userRoutes from "./src/routes/userRoutes.js";     // protected user actions
import schoolRoutes from "./src/routes/schoolRoutes.js"; // protected school create, public list/get

import authenticateToken from "./src/middleware/authenticateToken.js";
import errorHandler from "./src/middleware/errorMiddleware.js";

const app = express();
app.use(cors());
app.use(express.json());

// Public auth routes
app.use("/api/auth", authRoutes);

// Protect all user routes with JWT auth
app.use("/api/users", authenticateToken, userRoutes);

// Choose whether schools listing is public or protected.
// We'll protect creation but allow public GETs in routes: keep authenticateToken to protect POST only.
// To keep it simple: protect all school routes; if you want public listing move authenticateToken to router-level.
app.use("/api/schools", authenticateToken, schoolRoutes);

// Health
app.get("/", (_req, res) => res.send("Backend live"));

// Error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
