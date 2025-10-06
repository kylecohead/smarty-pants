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
import { CATEGORY_MAP } from "../src/config/categories.js";
import { fetchCategoryQuestions } from "../src/utils/opentdb.js";

const prisma = new PrismaClient();

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
    const questions = await fetchCategoryQuestions(id, name, 10);

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
