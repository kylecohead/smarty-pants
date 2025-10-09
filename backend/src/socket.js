import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * In-memory runtime session store
 * key: matchId → {
 *   hostId,
 *   questionIndex,
 *   questions,                           // fetched from DB
 *   scores: {},                          // username → total score
 *   started,
 *   timeLimit: number,                   // seconds per question (from DB)
 *   players: Map<socketId, { userId, username, avatarUrl }>,
 *   advanceTimeout: NodeJS.Timeout,      // Timer for next question after results
 *   questionTimer: NodeJS.Timeout,       // Timer for synchronized leaderboard display
 *   currentQuestionResponses: Map,       // username → response for current question
 * }
 */
const activeMatches = new Map();

// =============================================================
//  Fetch questions from database (mapped for frontend)
// =============================================================
async function getQuestionsFromDB() {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        question: true, // DB column
        correct: true,  // DB column
        options: true,  // String[]
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

function clearAdvanceTimeout(match) {
  if (match?.advanceTimeout) {
    clearTimeout(match.advanceTimeout);
    match.advanceTimeout = null;
  }
}

function endMatch(io, matchId) {
  const match = activeMatches.get(matchId);
  if (!match) return;
  clearAdvanceTimeout(match);

  io.to(`match-${matchId}`).emit("matchEnded", { scores: match.scores });
  console.log(`🏁 Match ${matchId} ended`);

  activeMatches.delete(matchId);
  prisma.match
    .update({
      where: { id: Number(matchId) },
      data: { status: "FINISHED" },
    })
    .catch(console.error);
}

function sendQuestion(io, matchId) {
  const match = activeMatches.get(matchId);
  if (!match) return;
  
  if (match.questionIndex >= match.questions.length || !match.questions[match.questionIndex]) {
    endMatch(io, matchId); // Use existing endMatch function for proper cleanup
    return;
  }

  // Clear any pending "advance to next" timer before sending a fresh Q
  clearAdvanceTimeout(match);

  // Reset responses for this question
  match.currentQuestionResponses = new Map();

  // Use the match's configured time limit (stored in seconds, convert to ms)
  const questionDurationMs = (match.timeLimit || 10) * 1000;

  console.log(`🧠 Sending question ${match.questionIndex + 1}/${match.questions.length} for match ${matchId} (${match.timeLimit}s)`);
  io.to(`match-${matchId}`).emit("newQuestion", {
    index: match.questionIndex,
    total: match.questions.length,
    q: match.questions[match.questionIndex].q,
    options: match.questions[match.questionIndex].options,
    timeLimit: questionDurationMs, // ms
  });

  // Start timer for synchronized leaderboard display
  // Leaderboard shows ONLY when timer expires, not when all players answer
  match.questionTimer = setTimeout(() => {
    console.log(`⏰ Question timer expired - showing synchronized leaderboard`);
    showQuestionResults(io, matchId);
  }, questionDurationMs);
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
        clearAdvanceTimeout(match);
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
            questions: [],
            scores: {},
            started: false,
            players: new Map(),
            advanceTimeout: null,
            questionTimer: null, // Timer for synchronized leaderboard display
            currentQuestionResponses: new Map(), // Track player responses per question
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
        select: { 
          hostId: true, 
          timeLimit: true, // Get the time limit per question
        },
      });

      if (!dbMatch || dbMatch.hostId !== socket.userId) {
        socket.emit("error", { message: "Only host can start match" });
        return;
      }

      match.started = true;
      match.questionIndex = 0;
      match.timeLimit = dbMatch.timeLimit || 10; // Store timeLimit in seconds
      clearAdvanceTimeout(match);

      await prisma.match.update({
        where: { id: Number(matchId) },
        data: { status: "ACTIVE" },
      });

      console.log(`🎮 Host started match ${matchId} with ${match.timeLimit}s per question`);

      // Fetch questions assigned to this specific match
      const matchQuestions = await prisma.matchQuestion.findMany({
        where: { matchId: Number(matchId) },
        include: { question: true },
        orderBy: { order: "asc" },
      });

      if (matchQuestions.length === 0) {
        socket.emit("error", { message: "No questions available" });
        return;
      }

      // Map to game structure
      match.questions = matchQuestions.map((mq) => ({
        q: mq.question.question,
        options: mq.question.options,
        answer: mq.question.correct,
      }));
      match.questionIndex = 0;

      console.log(`📚 Loaded ${match.questions.length} questions for match ${matchId}`);

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
        total: match.questions.length,
        q: current.q,
        options: current.options,
        timeLimit: (match.timeLimit || 10) * 1000, // Use match's time limit (convert to ms)
      });
    });

    // ---------------- SUBMIT ANSWER ----------------
    socket.on("submitAnswer", ({ matchId, answer, elapsedTimeMs }) => {
      const match = activeMatches.get(matchId);
      if (!match || !match.started) return;

      const question = match.questions?.[match.questionIndex];
      if (!question) return;

      // Initialize responses tracking for this question if not exists
      if (!match.currentQuestionResponses) {
        match.currentQuestionResponses = new Map();
      }

      // Check if player already answered this question
      if (match.currentQuestionResponses.has(socket.username)) {
        console.log(`⚠️ ${socket.username} already answered this question`);
        return;
      }

      const correct =
        (answer ?? "").trim().toLowerCase() === question.answer.toLowerCase();

      // Time-based scoring formula - use match's configured time limit
      const timeLimitMs = (match.timeLimit || 10) * 1000;
      const timeFactor = Math.max(0, 1 - (elapsedTimeMs || 0) / timeLimitMs);
      const points = correct ? Math.round(1 + 4 * timeFactor) : 0;

      match.scores[socket.username] = (match.scores[socket.username] || 0) + points;

      // Store this player's response
      match.currentQuestionResponses.set(socket.username, {
        username: socket.username,
        answer,
        correct,
        points,
        elapsedTimeMs,
      });

      console.log(`📝 ${socket.username} answered (${match.currentQuestionResponses.size}/${match.players.size}) - waiting for timer`);

      // Send immediate feedback to just this player
      socket.emit("answerSubmitted", {
        correct,
        points,
        correctAnswer: question.answer,
      });

      // NOTE: We do NOT show results immediately even if all players answered
      // Results will be shown when the question timer expires (synchronized)
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

function showQuestionResults(io, matchId) {
  const match = activeMatches.get(matchId);
  if (!match) return;

  clearAdvanceTimeout(match);

  // Clear the question timer
  if (match.questionTimer) {
    clearTimeout(match.questionTimer);
    match.questionTimer = null;
  }

  // Collect all responses (including non-responders)
  const allResponses = [];
  for (const [socketId, player] of match.players) {
    const response = match.currentQuestionResponses.get(player.username);
    if (response) {
      allResponses.push({
        username: player.username,
        correct: response.correct,
        points: response.points,
        answered: true,
      });
    } else {
      // Player didn't answer in time - treat as incorrect (0 points)
      allResponses.push({
        username: player.username,
        correct: false,
        points: 0,
        answered: false,
      });
      // Ensure they get 0 points in the scores
      if (match.scores[player.username] === undefined) {
        match.scores[player.username] = 0;
      }
    }
  }

  // Send results to ALL players
  io.to(`match-${matchId}`).emit("questionResults", {
    responses: allResponses,
    scores: match.scores,
    correctAnswer: match.questions[match.questionIndex].answer,
  });

  console.log(`📊 Question ${match.questionIndex + 1} results sent to all players`);

  // Clear responses for next question
  match.currentQuestionResponses = new Map();

  // Schedule next question
  match.advanceTimeout = setTimeout(() => {
    const stillThere = activeMatches.get(matchId);
    if (!stillThere) return;
    stillThere.questionIndex++;
    stillThere.advanceTimeout = null;
    sendQuestion(io, matchId);
  }, 5000); // 5 seconds to view results
}
