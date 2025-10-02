// backend/prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

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

  // Questions
  const q1 = await prisma.question.upsert({
    where: { id: 1 },
    update: {},
    create: {
      category: "General Knowledge",
      difficulty: "easy",
      question: "What is 2 + 2?",
      correct: "4",
      options: ["3", "4", "5", "6"],
    },
  });

  const q2 = await prisma.question.upsert({
    where: { id: 2 },
    update: {},
    create: {
      category: "Science",
      difficulty: "easy",
      question: "What planet is known as the Red Planet?",
      correct: "Mars",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
    },
  });

  // Link questions to the match
  await prisma.matchQuestion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      matchId: match.id,
      questionId: q1.id,
      order: 1,
    },
  });

  await prisma.matchQuestion.upsert({
    where: { id: 2 },
    update: {},
    create: {
      matchId: match.id,
      questionId: q2.id,
      order: 2,
    },
  });

  // Answers
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

  console.log("✅ Database seeded with users, match, players, questions, and answers");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
