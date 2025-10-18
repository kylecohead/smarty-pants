// backend/src/routes/questions.js
// ===========================
// REST API endpoints for trivia question management
// Provides admin tools for importing, resetting, and managing questions
// Integrates with OpenTDB (Open Trivia Database) API
// ===========================

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { CATEGORY_MAP, QUESTIONS_PER_GAME } from "../config/categories.js";
import {
  decodeText,
  shuffle,
  sleep,
  fetchCategoryQuestions,
} from "../utils/opentdb.js";
import authMiddleware from "../middleware/authMiddleware.js";

//  admin guard for question management routes
function requireAdmin(req, res, next) {
  const role = req.user?.role || null;
  if (role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

const router = Router();
const prisma = new PrismaClient();

// Re-export QUESTIONS_PER_GAME for use in matches.js
export { QUESTIONS_PER_GAME };

// ===========================
// API Routes
// ===========================

router.get("/all", async (_req, res) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { id: "desc" }
    });

    res.json(questions);
  } catch (error) {
    console.error("Failed to fetch questions", error);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

router.get("/max-rounds", async (req, res) => {
  const { category, difficulty, questionsPerRound = 4 } = req.query;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  try {
    // Build question filter
    const questionWhere = { category };
    
    // Normalize difficulty if provided
    if (difficulty && difficulty.trim().length > 0) {
      questionWhere.difficulty = difficulty.toLowerCase();
    }

    // Count available questions
    const availableQuestions = await prisma.question.count({
      where: questionWhere,
    });

    const questionsPerRoundNum = Math.max(3, Math.min(10, parseInt(questionsPerRound)));
    const maxRounds = Math.floor(availableQuestions / questionsPerRoundNum);
    const cappedMaxRounds = Math.min(maxRounds, 5); // Cap at 5 rounds max

    res.json({
      availableQuestions,
      questionsPerRound: questionsPerRoundNum,
      maxPossibleRounds: cappedMaxRounds,
      category,
      difficulty: difficulty || null
    });
  } catch (error) {
    console.error("Error calculating max rounds:", error);
    res.status(500).json({ error: "Failed to calculate maximum rounds" });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const categories = await prisma.question.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" }
    });

    res.json(categories.map((c) => c.category));
  } catch (error) {
    console.error("Failed to load categories", error);
    res.status(500).json({ message: "Failed to load categories" });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const total = await prisma.question.count();
    const byCategory = await prisma.question.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { _count: { category: "desc" } }
    });

    res.json({
      total,
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count.category
      }))
    });
  } catch (error) {
    console.error("Failed to load stats", error);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

/**
 * GET /random/:category/:count
 * 
 * Fetch random questions from a specific category for gameplay.
 * Used when creating a new match to assign questions.
 * 
 * Path parameters:
 *   - category: Category name (e.g., "General Knowledge", "Sports")
 *   - count: Number of random questions to fetch (default: QUESTIONS_PER_GAME)
 * 
 * Response:
 *   - Array of random question objects from the specified category
 *   - Returns 404 if category has insufficient questions
 * 
 * Example: GET /api/questions/random/Sports/5
 */
router.get("/random/:category/:count", async (req, res) => {
  try {
    const { category } = req.params;
    const count = parseInt(req.params.count) || QUESTIONS_PER_GAME;

    // Validate count is positive
    if (count <= 0) {
      return res.status(400).json({ 
        message: "Count must be a positive number" 
      });
    }

    // Check if category has enough questions
    const available = await prisma.question.count({
      where: { category }
    });

    if (available < count) {
      return res.status(404).json({
        message: `Not enough questions in category "${category}". Available: ${available}, Requested: ${count}`
      });
    }

    // Fetch all questions from category and randomly select {count} of them
    // Using database to fetch all, then JS to shuffle (Prisma doesn't have RANDOM())
    const allQuestions = await prisma.question.findMany({
      where: { category }
    });

    // Shuffle array and take first {count} questions
    const shuffled = allQuestions
      .map((q) => ({ sort: Math.random(), value: q }))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, count)
      .map((item) => item.value);

    res.json(shuffled);
  } catch (error) {
    console.error("Failed to fetch random questions", error);
    res.status(500).json({ message: "Failed to fetch random questions" });
  }
});

/**
 * POST /import
 * 
 * Import new questions from OpenTDB, with category filtering and duplicate prevention.
 * 
 * Request body:
 *   - amount: Number of questions per category (default: 5)
 *   - category: Target category name or "All" (default: "All")
 * 
 * Behavior:
 *   - If category="All": Imports {amount} questions for each of the 5 categories
 *   - If category=specific: Imports {amount} questions for that category only
 *   - Prevents duplicates by checking against ALL existing questions upfront
 *   - Retries fetching if duplicates are encountered until target met or 12 attempts exhausted
 * 
 * Response:
 *   - totalImported: Total new questions added
 *   - totalSkipped: Questions that couldn't be fetched (target not met)
 *   - details: Per-category breakdown (requested, fetched, inserted, skipped)
 */
router.post("/import", async (req, res) => {
  // Parse request: default to 5 questions per category
  const requested = Number(req.body?.amount);
  const amount = Number.isFinite(requested) && requested > 0 ? requested : 5;
  
  // Parse category filter: null means "All categories"
  const rawCategory = typeof req.body?.category === "string" ? req.body.category.trim() : null;
  const normalizedFilter = rawCategory?.toLowerCase();
  const categoryFilter = normalizedFilter && normalizedFilter !== "all" ? normalizedFilter : null;

  // Determine which categories to import
  const selectedCategories = categoryFilter
    ? CATEGORY_MAP.filter((item) => item.name.toLowerCase() === categoryFilter)
    : CATEGORY_MAP;

  // Validate category name if filtering
  if (categoryFilter && selectedCategories.length === 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown category: ${rawCategory}`
    });
  }

  let totalImported = 0;
  let totalSkipped = 0;
  const details = [];

  try {
    // ===========================
    // Duplicate Prevention: Load ALL existing questions once
    // ===========================
    // More efficient than querying per batch. Build Set for O(1) lookups.
    const existing = await prisma.question.findMany({
      select: { question: true }
    });
    const existingSet = new Set(existing.map((item) => item.question));

    // ===========================
    // Fetch and Insert: Process each selected category
    // ===========================
    for (const { id, name } of selectedCategories) {
      const planned = []; // Questions ready for insertion (deduplicated)
      let attempts = 0;

      // Retry loop: Keep fetching until we have {amount} unique questions
      while (planned.length < amount && attempts < 12) {
        attempts += 1;
        const remaining = amount - planned.length;
        
        // Fetch batch from OpenTDB
        const batch = await fetchCategoryQuestions(id, name, remaining);

        // Filter out duplicates (both existing in DB and within this import session)
        for (const item of batch) {
          if (existingSet.has(item.question)) continue; // Already in DB
          
          // Add to both planned array and existingSet to prevent duplicates within this import
          existingSet.add(item.question);
          planned.push(item);

          if (planned.length >= amount) break;
        }

        // Pause before next attempt if we haven't met quota
        if (planned.length < amount) {
          await sleep(250);
        }
      }

      // Insert batch into database
      let inserted = 0;
      if (planned.length > 0) {
        const created = await prisma.question.createMany({
          data: planned
        });
        inserted = created.count;
        totalImported += inserted;
      }

      // Calculate how many we failed to fetch
      const skippedForCategory = Math.max(0, amount - inserted);
      totalSkipped += skippedForCategory;

      // Track per-category result for response details
      details.push({
        category: name,
        requested: amount,
        fetched: planned.length,
        inserted,
        skipped: skippedForCategory
      });

      // Rate limiting: Pause between categories
      await sleep(250);
    }

    // Return detailed summary
    res.json({
      success: true,
      totalImported,
      totalSkipped,
      scope: selectedCategories.length === 1 ? selectedCategories[0].name : "All",
      details
    });
  } catch (error) {
    console.error("Import failed", error);
    res.status(500).json({ message: "Failed to import questions" });
  }
});

/**
 * POST /reset
 * 
 * Nuclear option: Clear ALL questions and reseed with fresh set from OpenTDB.
 * 
 * Behavior:
 *   1. Delete all answers, match_questions, and questions (cascade safe)
 *   2. Fetch 10 fresh questions per category (50 total)
 *   3. Insert into clean database
 * 
 * Use case: Admin wants to start over with completely new question pool
 * 
 * Response:
 *   - totalSeeded: Total questions inserted
 *   - details: Per-category breakdown
 */
router.post("/reset", async (_req, res) => {
  const perCategory = 10; // Fixed amount for reset (matches seed.js)
  let totalSeeded = 0;
  const details = [];

  try {
    // ===========================
    // Step 1: Delete all question-related data
    // ===========================
    // Order matters: delete child records first (answers, match_questions) then parent (questions)
    await prisma.answer.deleteMany();
    await prisma.matchQuestion.deleteMany();
    await prisma.question.deleteMany();

    // ===========================
    // Step 2: Fetch and insert fresh questions
    // ===========================
    for (const { id, name } of CATEGORY_MAP) {
      // Fetch 10 questions from OpenTDB
      const prepared = await fetchCategoryQuestions(id, name, perCategory);
      
      // Insert into database
      const createdCount = prepared.length
        ? (await prisma.question.createMany({ data: prepared })).count
        : 0;

      totalSeeded += createdCount;
      
      // Track per-category result
      details.push({
        category: name,
        requested: perCategory,
        inserted: createdCount,
        skipped: Math.max(0, perCategory - createdCount)
      });

      // Rate limiting: Pause between categories
      await sleep(250);
    }

    res.json({ success: true, totalSeeded, details });
  } catch (error) {
    console.error("Reset failed", error);
    res.status(500).json({ message: "Failed to reset questions" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid question id" });
  }

  try {
    await prisma.question.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete failed", error);
    res.status(500).json({ message: "Failed to delete question" });
  }
});

/**
 * PUT /:id
 *
 * Update a question. Protected: admin-only.
 * Accepts partial or full updates for: category, difficulty, question, correct, options
 */
router.put("/:id", authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid question id" });
  }

  const { category, difficulty, question, correct, options } = req.body || {};

  // Build update object only with provided fields
  const updateData = {};
  if (typeof category === "string") updateData.category = category;
  if (typeof difficulty === "string") updateData.difficulty = difficulty;
  if (typeof question === "string") updateData.question = question;
  if (typeof correct === "string") updateData.correct = correct;

  if (Array.isArray(options)) {
    // Ensure options are strings
    updateData.options = options.map((o) => String(o));
  }

  // If provided options don't include the correct answer but correct is provided, ensure it's included
  if (updateData.correct && updateData.options) {
    if (!updateData.options.includes(updateData.correct)) {
      updateData.options = [updateData.correct, ...updateData.options];
    }
  }

  try {
    const updated = await prisma.question.update({
      where: { id },
      data: updateData,
    });
    res.json({ success: true, question: updated });
  } catch (error) {
    console.error("Update question failed", error);
    res.status(500).json({ message: "Failed to update question" });
  }
});

router.delete("/", async (_req, res) => {
  try {
    await prisma.answer.deleteMany();
    await prisma.matchQuestion.deleteMany();
    const result = await prisma.question.deleteMany();

    res.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error("Failed to clear questions", error);
    res.status(500).json({ message: "Failed to clear questions" });
  }
});

export default router;
