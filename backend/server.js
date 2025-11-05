// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

import authRoutes from "./src/routes/authRoutes.js"
import userRoutes from "./src/routes/userRoutes.js";
import schoolRoutes from "./src/routes/schoolRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

import authenticateToken from "./src/middleware/authenticateToken.js";
import errorHandler from "./src/middleware/errorMiddleware.js";

import campaignRoutes from "./src/routes/campaignRoutes.js";
import donationRoutes from "./src/routes/donationRoutes.js";

import paymentRoutes from "./src/routes/paymentRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());


app.use("/api/payments", paymentRoutes);
// Public auth routes
app.use("/api/auth", authRoutes);

// public & protected routing
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);

// app.use("/api/payments", authenticateToken, paymentRoutes);

// Chat routes
app.use("/api", chatRoutes); // This will make the route /api/chat

// Protect all user routes with JWT auth
app.use("/api/users", authenticateToken, userRoutes);

// School routes
app.use("/api/schools", schoolRoutes);

// Health
app.get("/", (_req, res) => res.send("Backend live"));

// Error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));