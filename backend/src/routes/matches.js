import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Create a new match
 */
router.post("/", authMiddleware, async (req, res) => {
  const { title, category, difficulty } = req.body;
  const userId = req.user.id;

  try {
    const match = await prisma.match.create({
      data: {
        title,
        category,
        difficulty,
        hostId: userId,
        players: {
          create: { userId } // host auto-joins
        }
      },
      include: {
        players: { include: { user: true } },
        host: true
      }
    });

    res.json(match);
  } catch (err) {
    console.error("❌ Create match failed:", err);
    res.status(500).json({ error: "Failed to create match" });
  }
});

/**
 * Get all matches (list view)
 * Supports filtering and sorting
 */
router.get("/", authMiddleware, async (req, res) => {
  const { category, sort } = req.query;

  try {
    const matches = await prisma.match.findMany({
      where: category ? { category } : {},
      orderBy: sort === "asc" ? { createdAt: "asc" } : { createdAt: "desc" },
      include: {
        players: { include: { user: true } },
        host: true
      }
    });

    res.json(matches);
  } catch (err) {
    console.error("❌ Fetch matches failed:", err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

/**
 * Join a match
 */
router.post("/:id/join", authMiddleware, async (req, res) => {
  const matchId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    // Prevent duplicate joins
    const alreadyJoined = await prisma.matchPlayer.findUnique({
      where: {
        matchId_userId: { matchId, userId }
      }
    });

    if (alreadyJoined) {
      return res.status(400).json({ error: "Already joined this match" });
    }

    const join = await prisma.matchPlayer.create({
      data: { matchId, userId }
    });

    res.json(join);
  } catch (err) {
    console.error("❌ Join match failed:", err);
    res.status(500).json({ error: "Failed to join match" });
  }
});

/**
 * Get details of a specific match (lobby view)
 */
router.get("/:id", authMiddleware, async (req, res) => {
  const matchId = parseInt(req.params.id);

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        host: true,
        players: { include: { user: true } },
        questions: {
          include: { question: true },
          orderBy: { order: "asc" }
        }
      }
    });

    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(match);
  } catch (err) {
    console.error("❌ Get match failed:", err);
    res.status(500).json({ error: "Failed to fetch match" });
  }
});

export default router;
