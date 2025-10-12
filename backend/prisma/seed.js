import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { CATEGORY_MAP } from "../src/config/categories.js";
import { fetchCategoryQuestions } from "../src/utils/opentdb.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  const questionCount = await prisma.question.count();
  if (questionCount > 0) {
    console.log(`🟡 Database already has ${questionCount} questions — skipping question seeding.`);
  } else {
    // Only seed questions if none exist
    console.log("🧠 No questions found — seeding new ones from OpenTDB...");

    // Clear question-related data (fresh start)
    await prisma.answer.deleteMany();
    await prisma.matchQuestion.deleteMany();
    await prisma.question.deleteMany();

    const seededQuestions = [];

    for (const { id, name } of CATEGORY_MAP) {
      const questions = await fetchCategoryQuestions(id, name, 10);
      if (questions.length < 10) {
        console.warn(`⚠️ Only fetched ${questions.length} questions for "${name}"`);
      }

      for (const question of questions) {
        const created = await prisma.question.create({ data: question });
        seededQuestions.push(created);
      }

      await new Promise((resolve) => setTimeout(resolve, 250)); // rate limit
    }

    if (!seededQuestions.length) {
      throw new Error("❌ No questions were seeded. Check OpenTDB availability.");
    }

    console.log(`✅ Inserted ${seededQuestions.length} questions.`);
  }

  // Always upsert users and match (safe to rerun)
  const password = await bcrypt.hash("1234", 10);

  const users = [
    { username: "Nina", email: "nina@example.com", role: "USER", avatarUrl: "/uploads/avatar1.png", gamesPlayed: 0, highScore: 2450, wins: 4, memberSince: new Date("2023-05-01") },
    { username: "Wikus", email: "wikus@example.com", role: "USER", avatarUrl: "/uploads/avatar2.png", gamesPlayed: 0, highScore: 2600, wins: 6, memberSince: new Date("2023-07-10") },
    { username: "Amy", email: "amy@example.com", role: "USER", avatarUrl: "/uploads/avatar3.png", gamesPlayed: 0, highScore: 0, wins: 0, memberSince: new Date("2024-01-20") },
    { username: "Conrad", email: "conrad@example.com", role: "USER", avatarUrl: "/uploads/avatar4.png", gamesPlayed: 0, highScore: 2700, wins: 10, memberSince: new Date("2022-11-15") },
    { username: "Kyle", email: "kyle@example.com", role: "USER", avatarUrl: "/uploads/avatar5.png", gamesPlayed: 0, highScore: 1900, wins: 3, memberSince: new Date("2024-03-02") },
    { username: "Admin", email: "admin@example.com", role: "ADMIN", avatarUrl: "/uploads/avatar6.png", gamesPlayed: 0, highScore: 3000, wins: 25, memberSince: new Date("2021-01-01") },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password },
    });
    createdUsers.push(user);
  }

  console.log("✅ Seed complete: users and (if empty) questions added.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
