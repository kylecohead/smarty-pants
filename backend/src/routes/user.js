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

// Increment games played once a match has ended
router.post('/:id/increment-games', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        gamesPlayed: {
          increment: 1
        }
      }
    });
    
    res.json({ success: true, gamesPlayed: updatedUser.gamesPlayed });
  } catch (error) {
    console.error('Failed to increment games played:', error);
    res.status(500).json({ error: 'Failed to update games played count' });
  }
});

// Increment wins when a user wins a match
router.post('/:id/increment-wins', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        wins: {
          increment: 1
        }
      }
    });

    res.json({ success: true, wins: updatedUser.wins });
  } catch (error) {
    console.error("Failed to increment wins:", error);
    res.status(500).json({ error: 'Failed to update wins count' });
  }
});

// Update high score when a new high score is achieved
router.post('/:id/update-highscore', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);
  const newScore = parseInt(req.body.score);

  try {
    // First get the current user to check existing high score
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { highScore: true }
    });

    // Update if a new high score has been achieved
    if (!user.highScore || newScore > user.highScore) {
      const updatedUser = await prisma.user.update({
        where : { id: userId },
        data: {
          highScore: newScore
        }
      });

      res.json({
        success: true,
        highScore: updatedUser.highScore,
        isNewRecord: true
      });
    } else {
      res.json({
        success: true,
        highScore: user.highScore,
        isNewRecord: false
      });
    }
  } catch (error) {
    console.error("Failed to update high score:", error); 
    res.status(500).json({ error: 'Failed to update high score' });
  }
});

export default router;
