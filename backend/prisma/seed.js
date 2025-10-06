// backend/prisma/seed.js
// ===========================
// Database seeding script for initial data population
// Fetches trivia questions from OpenTDB API and populates the database with:
// - Demo users (including an admin account)
// - A sample match
// - 10 questions per category from 5 categories (50 total questions)
// ===========================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Categories matched to OpenTDB API category IDs
// These must align with the categories used in routes/questions.js
const CATEGORY_MAP = [
  { id: 9, name: "General Knowledge" },
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Science: Computers" },
  { id: 23, name: "History" },
  { id: 21, name: "Sports" }
];

/**
 * Decode HTML entities from OpenTDB API responses.
 * The API returns questions with HTML-encoded special characters.
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
 * Randomize array order using Fisher-Yates shuffle.
 * Used to shuffle answer options so correct answer isn't always in same position.
 */
const shuffle = (items) =>
  items
    .map((item) => ({ sort: Math.random(), value: item }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

/**
 * Fetch questions from OpenTDB for a specific category with retry logic.
 * 
 * @param {number} categoryId - OpenTDB category ID (e.g., 9 for General Knowledge)
 * @param {string} displayName - Human-readable category name for database storage
 * @param {number} amount - Target number of questions to fetch (default: 10)
 * @returns {Promise<Array>} - Array of question objects ready for database insertion
 * 
 * Features:
 * - Retry logic: Up to 12 attempts to reach target question count
 * - Rate limit handling: Exponential backoff when API returns code 5
 * - Duplicate detection: Uses Map keyed by question text to avoid duplicates
 * - HTML entity decoding: Cleans up question/answer text
 * - Option shuffling: Randomizes answer order
 */
async function fetchQuestionsForCategory(categoryId, displayName, amount = 10) {
  const collected = new Map(); // Use Map to deduplicate by question text
  let attempts = 0;

  // Retry loop: Keep fetching until we have enough unique questions or exhaust attempts
  while (collected.size < amount && attempts < 12) {
    attempts += 1;

    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&type=multiple&category=${categoryId}`
    );
    const payload = await response.json();

    // OpenTDB rate limit detection: response_code 5 means "too many requests"
    if (payload.response_code === 5) {
      // Exponential backoff: start at 300ms, add 150ms per attempt, cap at 1500ms
      const backoff = Math.min(1500, 300 + attempts * 150);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      continue;
    }

    // Empty response: Wait briefly and try again
    if (!payload.results?.length) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      continue;
    }

    // Process each question in the batch
    for (const item of payload.results) {
      const questionText = decodeText(item.question);
      
      // Skip duplicates (same question text already collected)
      if (collected.has(questionText)) continue;

      const correct = decodeText(item.correct_answer);
      const incorrect = item.incorrect_answers.map((ans) => decodeText(ans));

      // Store question in Map with all required fields
      collected.set(questionText, {
        category: displayName,           // Use our display name, not OpenTDB's
        difficulty: item.difficulty,
        question: questionText,
        correct,
        options: shuffle([correct, ...incorrect]) // Randomize answer order
      });

      // Stop processing this batch if we've hit our target
      if (collected.size >= amount) break;
    }
  }

  return Array.from(collected.values());
}

async function main() {
  console.log("Starting seed...");

  const password = await bcrypt.hash("1234", 10);

  // Define users with mock stats
  const users = [
    {
      username: "Nina",
      email: "nina@example.com",
      role: "USER",
      avatarUrl: "/uploads/avatar1.png",
      gamesPlayed: 10,
      highScore: 2450,
      wins: 4,
      memberSince: new Date("2023-05-01"),
    },
    {
      username: "Wikus",
      email: "wikus@example.com",
      role: "USER",
      avatarUrl: "/uploads/avatar2.png",
      gamesPlayed: 15,
      highScore: 2600,
      wins: 6,
      memberSince: new Date("2023-07-10"),
    },
    {
      username: "Amy",
      email: "amy@example.com",
      role: "USER",
      avatarUrl: "/uploads/avatar3.png",
      gamesPlayed: 5,
      highScore: 1800,
      wins: 2,
      memberSince: new Date("2024-01-20"),
    },
    {
      username: "Conrad",
      email: "conrad@example.com",
      role: "USER",
      avatarUrl: "/uploads/avatar4.png",
      gamesPlayed: 20,
      highScore: 2700,
      wins: 10,
      memberSince: new Date("2022-11-15"),
    },
    {
      username: "Kyle",
      email: "kyle@example.com",
      role: "USER",
      avatarUrl: "/uploads/avatar5.png",
      gamesPlayed: 8,
      highScore: 1900,
      wins: 3,
      memberSince: new Date("2024-03-02"),
    },
    {
      username: "Admin",
      email: "admin@example.com",
      role: "ADMIN",
      avatarUrl: "/uploads/avatar6.png",
      gamesPlayed: 50,
      highScore: 3000,
      wins: 25,
      memberSince: new Date("2021-01-01"),
    },
  ];

  // Upsert all users
  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        username: u.username,
        email: u.email,
        password,
        role: u.role,
        avatarUrl: u.avatarUrl,
        gamesPlayed: u.gamesPlayed,
        highScore: u.highScore,
        wins: u.wins,
        memberSince: u.memberSince,
      },
    });
    createdUsers.push(user);
  }

  // Pick first user as host
  const host = createdUsers[0];

  // Create a match
  const match = await prisma.match.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Demo Match",
      category: "General Knowledge",
      difficulty: "easy",
      hostId: host.id,
      status: "LOBBY",
    },
  });

  // Create MatchPlayer records (all users join the match)
  for (const u of createdUsers) {
    await prisma.matchPlayer.upsert({
      where: {
        matchId_userId: { matchId: match.id, userId: u.id },
      },
      update: {},
      create: {
        matchId: match.id,
        userId: u.id,
        score: 0,
      },
    });
  }

  // ===========================
  // Question Seeding: Fetch 10 questions per category from OpenTDB
  // ===========================
  
  // Clear all question-related data to ensure fresh seed (no duplicates from previous runs)
  await prisma.answer.deleteMany();
  await prisma.matchQuestion.deleteMany();
  await prisma.question.deleteMany();

  const seededQuestions = [];

  // Fetch and insert questions for each category (10 per category = 50 total)
  for (const { id, name } of CATEGORY_MAP) {
    const questions = await fetchQuestionsForCategory(id, name, 10);

    // Warn if we couldn't fetch full quota (OpenTDB might be down or category depleted)
    if (questions.length < 10) {
      console.warn(
        `Warning: Only fetched ${questions.length} questions for category "${name}"`
      );
    }

    // Insert each question into database
    for (const question of questions) {
      const created = await prisma.question.create({
        data: question
      });
      seededQuestions.push(created);
    }

    // Rate limiting: Pause between categories to avoid OpenTDB throttling
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  // Fail loudly if no questions were fetched (likely network/API issue)
  if (!seededQuestions.length) {
    throw new Error("No questions were seeded. Check OpenTDB availability.");
  }

  // ===========================
  // Demo Match Setup: Link sample questions to the demo match
  // ===========================
  
  // Find first General Knowledge question for demo match
  const [firstGeneral] = seededQuestions.filter(
    (q) => q.category === "General Knowledge"
  );
  
  // Find first Science question (any science category) for demo match
  const [firstScience] = seededQuestions.filter(
    (q) => q.category.startsWith("Science")
  );

  if (firstGeneral) {
    await prisma.matchQuestion.create({
      data: {
        matchId: match.id,
        questionId: firstGeneral.id,
        order: 1,
      },
    });
  }

  if (firstScience) {
    await prisma.matchQuestion.create({
      data: {
        matchId: match.id,
        questionId: firstScience.id,
        order: 2,
      },
    });
  }

  console.log("Database seeded with users, match, players, and fresh questions");
}

main()
  .catch((e) => {
  console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
