import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authenticateToken from "./src/middleware/authenticateToken.js";

import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is live");
});

// Example protected route
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}` });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
