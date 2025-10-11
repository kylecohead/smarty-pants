import { Router } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = Router();

// GET current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
       select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        gamesPlayed: true,
        highScore: true,
        wins: true,
        memberSince: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("❌ GET /me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE current user
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { username, password, avatarUrl } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (password) {
      const hashed = await bcrypt.hash(password, 12);
      updateData.password = hashed;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, username: true, email: true, avatarUrl: true },
    });

    res.json({ user });
  } catch (err) {
    console.error("❌ PUT /me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// SEARCH users by username
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const searchTerm = q.trim().toLowerCase();
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: searchTerm,
          mode: 'insensitive'
        },
        id: {
          not: req.user.id // Exclude current user from search results
        }
      },
      select: {
        id: true,
        username: true
      },
      orderBy: {
        username: 'asc'
      },
      take: 10 // Limit to 10 results
    });

    res.json({ users });
  } catch (err) {
    console.error("❌ GET /search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
