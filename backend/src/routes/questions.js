// backend/src/routes/questions.js
// ===========================
// REST API endpoints for trivia question management
// Provides admin tools for importing, resetting, and managing questions
// Integrates with OpenTDB (Open Trivia Database) API
// ===========================

import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// ===========================
// Game Configuration Constants
// ===========================

/**
 * Default number of questions per game
 * This can be changed if we want to add user selection in CreateGame later
 */
export const QUESTIONS_PER_GAME = 5;

// Categories matched to OpenTDB API IDs
// MUST match CATEGORY_MAP in prisma/seed.js for consistency
const CATEGORY_MAP = [
  { id: 9, name: "General Knowledge" },
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Science: Computers" },
  { id: 23, name: "History" },
  { id: 21, name: "Sports" }
];

/**
 * Decode HTML entities from OpenTDB responses
 * (See seed.js for detailed explanation)
 */
const decodeText = (value = "") =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&shy;/g, "")
    .replace(/&eacute;/g, "é")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&auml;/g, "ä");

/**
 * Randomize array order (Fisher-Yates shuffle)
 * (See seed.js for detailed explanation)
 */
const shuffle = (items) => {
  return items
    .map((item) => ({ sort: Math.random(), value: item }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

/**
 * Promisified setTimeout for rate limiting pauses
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch questions from OpenTDB with retry logic and rate limit handling
 * 
 * Identical to seed.js implementation but exposed here for import/reset endpoints.
 * 
 * @param {number} categoryId - OpenTDB category ID
 * @param {string} displayName - Database-friendly category name
 * @param {number} amount - Target number of unique questions
 * @returns {Promise<Array>} - Deduplicated question objects
 * 
 * Key features:
 * - Up to 12 retry attempts
 * - Exponential backoff for rate limit (code 5)
 * - Duplicate detection via Map keyed on question text
 */
async function fetchCategoryQuestions(categoryId, displayName, amount) {
  const collected = new Map(); // Deduplicate by question text
  let attempts = 0;

  while (collected.size < amount && attempts < 12) {
    attempts += 1;

    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&type=multiple&category=${categoryId}`
    );
    const payload = await response.json();

    // Rate limit detection: response_code 5 = "too many requests"
    if (payload.response_code === 5) {
      // Exponential backoff: 300ms base + 150ms per attempt, max 1500ms
      const backoff = Math.min(1500, 300 + attempts * 150);
      await sleep(backoff);
      continue;
    }

    // Empty results: pause and retry
    if (!payload.results?.length) {
      await sleep(150);
      continue;
    }

    // Process batch, deduplicating and shuffling options
    for (const item of payload.results) {
      const questionText = decodeText(item.question);
      if (collected.has(questionText)) continue; // Skip duplicates

      const correct = decodeText(item.correct_answer);
      const incorrect = item.incorrect_answers.map((ans) => decodeText(ans));

      collected.set(questionText, {
        category: displayName,
        difficulty: item.difficulty,
        question: questionText,
        correct,
        options: shuffle([correct, ...incorrect])
      });

      if (collected.size >= amount) break;
    }
  }

  return Array.from(collected.values());
}

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
