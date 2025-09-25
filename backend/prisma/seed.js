// backend/prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const password = await bcrypt.hash("1234", 10);

  // Define your users
  const users = [
    { username: "Nina", email: "nina@example.com", role: "USER" },
    { username: "Wikus", email: "wikus@example.com", role: "USER" },
    { username: "Amy", email: "amy@example.com", role: "USER" },
    { username: "Conrad", email: "conrad@example.com", role: "USER" },
    { username: "Kyle", email: "kyle@example.com", role: "USER" },
    { username: "Admin", email: "admin@example.com", role: "ADMIN" },
  ];

  // Upsert all users
  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {}, // no updates for now
      create: {
        username: u.username,
        email: u.email,
        password,
        role: u.role,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`,
      },
    });
    createdUsers.push(user);
  }

  // Pick first user as match host
  const host = createdUsers[0];

  // Create or update a match
  const match = await prisma.match.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Demo Match",
      category: "General Knowledge",
      difficulty: "easy",
      hostId: host.id,
      players: {
        connect: createdUsers.map((u) => ({ id: u.id })), // all 6 join
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

  // Answers (just Nina for demo)
  await prisma.answer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      selected: "4",
      isCorrect: true,
      userId: host.id,
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
      userId: host.id,
      questionId: q2.id,
      matchId: match.id,
    },
  });

  console.log("✅ Database seeded with 6 users, 1 match, 2 questions, 2 answers");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
