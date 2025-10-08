import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";
import { QUESTIONS_PER_GAME } from "./questions.js";
import { shuffle } from "../utils/opentdb.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Create a new match
 * 
 * Automatically assigns random questions from the selected category.
 * Uses QUESTIONS_PER_GAME constant (default: 5) for number of questions.
 */
router.post("/", authMiddleware, async (req, res) => {
  const { title, category, difficulty, timeLimit } = req.body;
  const userId = req.user.id;

  try {
    // Step 1: Check if category has enough questions
    const availableQuestions = await prisma.question.count({
      where: { category }
    });

    if (availableQuestions < QUESTIONS_PER_GAME) {
      return res.status(400).json({ 
        error: `Not enough questions in category "${category}". Available: ${availableQuestions}, Required: ${QUESTIONS_PER_GAME}` 
      });
    }

    // Step 2: Fetch random questions from the selected category
    const allCategoryQuestions = await prisma.question.findMany({
      where: { category }
    });

    // Shuffle and take first QUESTIONS_PER_GAME questions
    const shuffledQuestions = shuffle(allCategoryQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, QUESTIONS_PER_GAME);

    // Step 3: Create match with questions assigned
    const match = await prisma.match.create({
      data: {
        title,
        category,
        difficulty,
        timeLimit: timeLimit || 10, // Seconds per question, default to 10
        hostId: userId,
        players: {
          create: { userId } // host auto-joins
        },
        questions: {
          create: selectedQuestions.map((q, index) => ({
            questionId: q.id,
            order: index + 1 // 1-based ordering
          }))
        }
      },
      include: {
        players: { include: { user: true } },
        host: true,
        questions: {
          include: { question: true },
          orderBy: { order: "asc" }
        }
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
