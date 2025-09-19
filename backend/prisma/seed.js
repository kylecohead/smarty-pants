// backend/prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {}, // nothing to update for now
    create: {
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      avatarUrl: "https://example.com/avatar.png",
    },
  });

  // Create or update a match hosted by that user
  const match = await prisma.match.upsert({
    where: { id: 1 }, // use a known ID or make a unique title constraint
    update: {},
    create: {
      title: "Demo Match",
      category: "General Knowledge",
      difficulty: "easy",
      hostId: user.id,
      players: {
        connect: { id: user.id },
      },
    },
  });

  // Questions
  const q1 = await prisma.question.upsert({
    where: { id: 1 },
    update: {},
    create: {
      category: "General Knowledge",
      question: "What is 2 + 2?",
      correct: "4",
      options: ["3", "4", "5", "6"],
      matchId: match.id,
    },
  });

  const q2 = await prisma.question.upsert({
    where: { id: 2 },
    update: {},
    create: {
      category: "Science",
      question: "What planet is known as the Red Planet?",
      correct: "Mars",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      matchId: match.id,
    },
  });

  // Answers
  await prisma.answer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      selected: "4",
      isCorrect: true,
      userId: user.id,
      questionId: q1.id,
      matchId: match.id,
    },
  });

  await prisma.answer.upsert({
    where: { id: 2 },
    update: {},
    create: {
      selected: "Venus",
      isCorrect: false,
      userId: user.id,
      questionId: q2.id,
      matchId: match.id,
    },
  });

  console.log("✅ Database seeded with minimal data (idempotent)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
