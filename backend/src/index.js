// backend/src/index.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import matchesRouter from "./routes/matches.js";
import imageRoutes from "./routes/images.js";
import userRoutes from "./routes/user.js";
import questionRoutes from "./routes/questions.js";
import authMiddleware from "./middleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
import http from "http";               
import setupSocket from "./socket.js";
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Authentication ================
// Mount auth under /api/auth (consistent with the rest of API)
app.use("/api/auth", authRoutes);

// Images ========================
// Mount image upload routes under /api/images
app.use("/api/images", imageRoutes);

// Static serve (so /uploads/<file> works)
app.use("/uploads", express.static("uploads"));

// Matches =======================
app.use("/api/matches", authMiddleware, matchesRouter);

// Get/Set the current user info ================================
app.use("/api/users", userRoutes);

// Questions (scraper + admin tools) ==========================
app.use("/api/questions", questionRoutes);

// Socket.IO =================================================
const server = http.createServer(app);
setupSocket(server);
//  ===========================================================

// start the *server*, not the app
server.listen(3000, () => {
  console.log("🚀 Backend + Socket.IO running on http://localhost:3000");
});
