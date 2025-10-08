// backend/src/index.js
import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
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
app.use(cookieParser());

// === SESSION MIDDLEWARE ===
app.use(
  session({
    secret: process.env.SESSION_SECRET || "smartie-pants-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site cookies in production
    },
    name: "smartie.sid", // Custom session cookie name
  })
);

// === HEALTH CHECK ===
app.get("/health", (req, res) => res.json({ status: "ok" }));

// === ROUTES ===
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/matches", authMiddleware, matchesRouter);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);

// === SOCKET.IO SETUP ===
const server = http.createServer(app);
setupSocket(server);

// === START SERVER ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend + Socket.IO running on http://0.0.0.0:${PORT}`);
});
