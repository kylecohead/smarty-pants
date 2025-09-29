// backend/src/index.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import matchesRouter from "./routes/matches.js";
import imageRoutes from "./routes/images.js";
import authMiddleware from "./middleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
import http from "http";               
import { Server } from "socket.io";    

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
// Protected routes
app.use("/api/matches", authMiddleware, matchesRouter);

// Get the current user info ================================
app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, avatarUrl: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("❌ /api/me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
//============================================================


// Socker.IO =================================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // allow frontend dev server
});

const socketUsers = {};

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinMatch", ({ matchId, username }) => {
    socket.join(`match-${matchId}`);
    socketUsers[socket.id] = username;  // save username

    // Get all players in this room, map to usernames
    const socketIds = Array.from(io.sockets.adapter.rooms.get(`match-${matchId}`) || []);
    const players = socketIds.map((id) => socketUsers[id] || id);

    io.to(`match-${matchId}`).emit("playersUpdate", { matchId, players });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    delete socketUsers[socket.id];
  });
});
//  ===========================================================

// start the *server*, not the app
server.listen(3000, () => {
  console.log("🚀 Backend + Socket.IO running on http://localhost:3000");
});
