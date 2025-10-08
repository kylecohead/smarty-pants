import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * In-memory runtime session store
 * key: matchId → {
 *   hostId,
 *   questionIndex,
 *   questions,        // ← now fetched from DB
 *   scores: {},
 *   started,
 *   players: Map<socketId, { userId, username, avatarUrl }>
 * }
 */
const activeMatches = new Map();

// =============================================================
//  Fetch questions from database
// =============================================================
// =============================================================
//  Fetch questions from database (mapped for frontend)
// =============================================================
async function getQuestionsFromDB() {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        question: true,   // actual DB column
        correct: true,    // actual DB column
        options: true,    // String[]
      },
    });

    // Map DB structure → game structure
    return questions.map((q) => ({
      q: q.question,
      options: q.options,
      answer: q.correct,
    }));
  } catch (err) {
    console.error("❌ Failed to fetch questions from DB:", err);
    return [];
  }
}


// =============================================================
//  Utility helpers
// =============================================================
function emitPlayers(io, matchId) {
  const match = activeMatches.get(matchId);
  if (!match) return;

  const players = [...match.players.values()].map((p) => ({
    userId: p.userId,
    username: p.username,
    avatarUrl: p.avatarUrl,
    score: match.scores[p.username] || 0,
  }));

  io.to(`match-${matchId}`).emit("playersUpdate", { matchId, players });
}

function sendQuestion(io, matchId) {
  const match = activeMatches.get(matchId);
  if (!match) return;

  const question = match.questions?.[match.questionIndex];
  if (!question) {
    io.to(`match-${matchId}`).emit("matchEnded", { scores: match.scores });
    console.log(`🏁 Match ${matchId} ended`);
    activeMatches.delete(matchId);
    prisma.match
      .update({
        where: { id: Number(matchId) },
        data: { status: "FINISHED" },
      })
      .catch(console.error);
    return;
  }

  console.log(`🧠 Sending question ${match.questionIndex + 1} for match ${matchId}`);
  io.to(`match-${matchId}`).emit("newQuestion", {
    index: match.questionIndex,
    q: question.q,
    options: question.options,
  });
}

async function handlePlayerLeave(io, socket, matchId, manual = false) {
  const { userId, username } = socket;
  if (!matchId || !userId) return;

  console.log(
    `🚪 ${username || socket.id} ${
      manual ? "manually left" : "disconnected from"
    } match ${matchId}`
  );

  try {
    const match = activeMatches.get(matchId);
    if (!match) return;

    const player = match.players.get(socket.id);
    if (player) {
      player.disconnected = true;
    }

    setTimeout(async () => {
      const match = activeMatches.get(matchId);
      if (!match) return;

      const player = [...match.players.values()].find((p) => p.userId === userId);
      if (player && !player.disconnected) {
        console.log(`🔄 ${username} reconnected to match ${matchId}`);
        return;
      }

      match.players.delete(socket.id);
      await prisma.matchPlayer.updateMany({
        where: { matchId: Number(matchId), userId },
        data: { connected: false },
      });

      emitPlayers(io, matchId);

      if (match.hostId === userId) {
        await prisma.match.update({
          where: { id: Number(matchId) },
          data: { status: "PAUSED" },
        });
        io.to(`match-${matchId}`).emit("matchPaused");
      }

      if (match.players.size === 0) {
        activeMatches.delete(matchId);
        await prisma.match.update({
          where: { id: Number(matchId) },
          data: { status: "FINISHED" },
        });
        console.log(`🧹 Cleared empty match ${matchId}`);
      }
    }, 10000);
  } catch (err) {
    console.error("❌ Error during player leave:", err.message);
  }
}

// =============================================================
//  MAIN INITIALIZER
// =============================================================
export default function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_ORIGIN || "*", credentials: true },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    // ---------------- JOIN MATCH ----------------
    socket.on("joinMatch", async ({ matchId, token }) => {
      try {
        if (!matchId || !token) {
          socket.emit("error", { message: "Missing matchId or token" });
          return;
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded?.id;
        if (!userId) throw new Error("Invalid token payload");

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, username: true, avatarUrl: true },
        });
        if (!user) throw new Error("User not found");

        const dbMatch = await prisma.match.findUnique({
          where: { id: Number(matchId) },
          select: { id: true, status: true, hostId: true },
        });
        if (!dbMatch) throw new Error("Match not found");
        if (dbMatch.status === "FINISHED") throw new Error("Match already ended");

        if (!activeMatches.has(matchId)) {
          activeMatches.set(matchId, {
            hostId: dbMatch.hostId,
            questionIndex: 0,
            scores: {},
            started: false,
            players: new Map(),
          });
          console.log(`🆕 Created in-memory session for match ${matchId}`);
        }

        socket.join(`match-${matchId}`);
        socket.userId = userId;
        socket.username = user.username;
        socket.avatarUrl = user.avatarUrl;
        socket.matchId = matchId;

        const session = activeMatches.get(matchId);
        for (const [sid, p] of session.players) {
          if (p.userId === userId) session.players.delete(sid);
        }

        session.players.set(socket.id, {
          userId,
          username: user.username,
          avatarUrl: user.avatarUrl,
        });

        prisma.matchPlayer
          .upsert({
            where: { matchId_userId: { matchId: Number(matchId), userId } },
            update: { connected: true },
            create: { matchId: Number(matchId), userId },
          })
          .catch(console.error);

        emitPlayers(io, matchId);
        console.log(`✅ ${user.username} joined match ${matchId}`);
      } catch (err) {
        console.error("❌ joinMatch error:", err.message);
        socket.emit("error", { message: err.message });
      }
    });

    // ---------------- START MATCH (host only) ----------------
    socket.on("startMatch", async ({ matchId }) => {
      const match = activeMatches.get(matchId);
      if (!match) {
        socket.emit("error", { message: "Match not found" });
        return;
      }

      const dbMatch = await prisma.match.findUnique({
        where: { id: Number(matchId) },
        select: { hostId: true },
      });

      if (!dbMatch || dbMatch.hostId !== socket.userId) {
        socket.emit("error", { message: "Only host can start match" });
        return;
      }

      match.started = true;
      match.questionIndex = 0;

      await prisma.match.update({
        where: { id: Number(matchId) },
        data: { status: "ACTIVE" },
      });

      console.log(`🎮 Host started match ${matchId}`);

      // ✅ Fetch questions dynamically
      const dbQuestions = await getQuestionsFromDB();
      if (dbQuestions.length === 0) {
        socket.emit("error", { message: "No questions available" });
        return;
      }

      // ✅ Store them in memory for this match
      match.questions = dbQuestions.sort(() => Math.random() - 0.5);
      match.questionIndex = 0;

      console.log(`📚 Loaded ${match.questions.length} questions for match ${matchId}`);

      // ✅ Notify clients and send first question
      io.to(`match-${matchId}`).emit("matchStarted", { started: true });
      sendQuestion(io, matchId);
    });

    // ---------------- REQUEST CURRENT QUESTION ----------------
    socket.on("requestCurrentQuestion", ({ matchId }) => {
      const match = activeMatches.get(matchId);
      if (!match) {
        socket.emit("error", { message: "Match not found" });
        return;
      }

      const current = match.questions?.[match.questionIndex];
      if (!current) {
        socket.emit("error", { message: "No active question" });
        return;
      }

      console.log(`📤 [RESEND] Current question for match ${matchId}`);
      socket.emit("newQuestion", {
        index: match.questionIndex,
        q: current.q,
        options: current.options,
      });
    });

    // ---------------- SUBMIT ANSWER ----------------
    socket.on("submitAnswer", ({ matchId, answer }) => {
      const match = activeMatches.get(matchId);
      if (!match || !match.started) return;

      const question = match.questions?.[match.questionIndex];
      if (!question) return;

      const correct =
        answer?.trim().toLowerCase() === question.answer.toLowerCase();

      if (correct) {
        match.scores[socket.username] =
          (match.scores[socket.username] || 0) + 1;
      }

      io.to(`match-${matchId}`).emit("answerResult", {
        username: socket.username,
        correct,
      });

      // Move to next question after 2 seconds
      setTimeout(() => {
        match.questionIndex++;
        sendQuestion(io, matchId);
      }, 2000);
    });

    // ---------------- LEAVE MATCH ----------------
    socket.on("leaveMatch", async ({ matchId }) => {
      await handlePlayerLeave(io, socket, matchId, true);
    });

    // ---------------- DISCONNECT ----------------
    socket.on("disconnect", async () => {
      const { matchId } = socket;
      await handlePlayerLeave(io, socket, matchId, false);
    });
  });

  console.log("🎯 Socket.IO hybrid setup complete");
  return io;
}
