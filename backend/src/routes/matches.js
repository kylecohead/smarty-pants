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
  const { title, category, difficulty, numQuestions, timeLimit, isPublic, maxPlayers } = req.body;
  const userId = req.user.id;

  try {
    // Validate numQuestions (3-10 range, default to 5)
    const questionsCount = numQuestions && numQuestions >= 3 && numQuestions <= 10
      ? numQuestions
      : 5;

    // Validate timeLimit (5-60 seconds, default to 10)
    const timeLimitSeconds = timeLimit && timeLimit >= 5 && timeLimit <= 60 
      ? timeLimit 
      : 10;

    // Step 1: Check if category has enough questions
    const availableQuestions = await prisma.question.count({
      where: { category }
    });

    if (availableQuestions < questionsCount) {
      return res.status(400).json({ 
        error: `Not enough questions in category "${category}". Available: ${availableQuestions}, Required: ${questionsCount}` 
      });
    }

    // Step 2: Fetch random questions from the selected category
    const allCategoryQuestions = await prisma.question.findMany({
      where: { category }
    });

    // Shuffle and take first questionsCount questions
    const shuffledQuestions = shuffle(allCategoryQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, questionsCount);

    // Step 3: Create match with questions assigned
    const match = await prisma.match.create({
      data: {
        title,
        category,
        difficulty,
        timeLimit: timeLimitSeconds,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
        maxPlayers: maxPlayers && maxPlayers >= 2 && maxPlayers <= 20 ? maxPlayers : 5,
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
 * Query params:
 *   - category: filter by category
 *   - sort: "asc" or "desc" (default: desc)
 *   - isPublic: "true" to filter public games only
 *   - status: filter by match status (e.g., "LOBBY")
 */
router.get("/", authMiddleware, async (req, res) => {
  const { category, sort, isPublic, status } = req.query;

  try {
    // Build where clause dynamically
    const whereClause = {};
    if (category) whereClause.category = category;
    if (isPublic === "true") whereClause.isPublic = true;
    if (status) whereClause.status = status;

    const matches = await prisma.match.findMany({
      where: whereClause,
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
