// backend/src/index.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import matchesRouter from "./routes/matches.js";
import imageRoutes from "./routes/images.js";
import userRoutes from "./routes/user.js";
import questionRoutes from "./routes/questions.js";
import notificationRoutes from "./routes/notifications.js";
import authMiddleware from "./middleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
import http from "http";
import setupSocket from "./socket.js";

const prisma = new PrismaClient();
const app = express();

// === GLOBAL MIDDLEWARE ===
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.FRONTEND_ORIGIN || "*",
    ],
    credentials: true,
  })
);
app.use(express.json());

// === HEALTH CHECK ===
app.get("/health", (req, res) => res.json({ status: "ok" }));

// === ROUTES ===
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/matches", authMiddleware, matchesRouter);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/notifications", notificationRoutes);

// === SOCKET.IO SETUP ===
const server = http.createServer(app);
setupSocket(server);

// === START SERVER ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend + Socket.IO running on http://0.0.0.0:${PORT}`);
});
