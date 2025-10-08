import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * In-memory runtime session store
 * key: matchId → {
 *   hostId,
 *   questionIndex,
 *   questions,        // fetched from DB
 *   scores: {},
 *   started,
 *   players: Map<socketId, { userId, username, avatarUrl }>,
 *   advanceTimeout: NodeJS.Timeout | null,   // ← NEW: guard next-question timer
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

  // Check if game is over
  if (match.questionIndex >= match.questions.length) {
    console.log(`🏁 Match ${matchId} ended - all questions answered`);
    io.to(`match-${matchId}`).emit("matchEnded", { scores: match.scores });
    activeMatches.delete(matchId);
    
    // Update match status in database
    prisma.match
      .update({
        where: { id: Number(matchId) },
        data: { status: "FINISHED" },
      })
      .catch(console.error);
    return;
  }

  // Clear any pending "advance to next" timer before sending a fresh Q
  clearAdvanceTimeout(match);

  // Clear answered players for new question
  if (match.answeredPlayers) match.answeredPlayers.clear();

  console.log(`🧠 Sending question ${match.questionIndex + 1}/${match.questions.length} for match ${matchId}`);
  io.to(`match-${matchId}`).emit("newQuestion", {
    index: match.questionIndex, // Send 0-based index, frontend will add 1 for display
    total: match.questions.length,
    q: match.questions[match.questionIndex].q,
    options: match.questions[match.questionIndex].options,
    timeLimit: (match.timeLimit || 10) * 1000, // Convert seconds to ms
  });

  // Set up auto-advance timer (advances when time runs out)
  const timeLimit = (match.timeLimit || 10) * 1000;
  console.log(`⏱️  Setting ${timeLimit}ms timer for question ${match.questionIndex + 1}`);
  match.advanceTimeout = setTimeout(() => {
    const stillThere = activeMatches.get(matchId);
    if (!stillThere) return;
    
    console.log(`⏰ Time's up for question ${stillThere.questionIndex + 1} after ${timeLimit}ms - emitting timeUp`);
    
    const currentQuestion = stillThere.questions[stillThere.questionIndex];
    
    // Give 0 points to players who didn't answer and emit answerResult
    for (const [socketId, player] of stillThere.players) {
      if (!stillThere.answeredPlayers || !stillThere.answeredPlayers.has(player.username)) {
        console.log(`⏰ ${player.username} didn't answer in time - giving 0 points`);
        
        // Emit answerResult to the player who didn't answer
        const playerSocket = io.sockets.sockets.get(socketId);
        if (playerSocket) {
          playerSocket.emit("answerResult", {
            username: player.username,
            correct: false,
            points: 0,
            correctAnswer: currentQuestion.answer,
          });
        }
      }
    }
    
    // Emit timeUp event to show recap on frontend
    io.to(`match-${matchId}`).emit("timeUp", {});
    
    // Wait 3 seconds to show recap, then advance
    setTimeout(() => {
      const match = activeMatches.get(matchId);
      if (!match) return;
      
      match.answeredPlayers.clear();
      match.questionIndex++;
      match.advanceTimeout = null;
      sendQuestion(io, matchId);
    }, 3000);
  }, timeLimit); // No buffer - timer is exact
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
          select: { id: true, status: true, hostId: true, timeLimit: true },
        });
        if (!dbMatch) throw new Error("Match not found");
        if (dbMatch.status === "FINISHED") throw new Error("Match already ended");

        if (!activeMatches.has(matchId)) {
          activeMatches.set(matchId, {
            hostId: dbMatch.hostId,
            timeLimit: dbMatch.timeLimit || 10, // Load timer from database (in seconds)
            questionIndex: 0,
            questions: [],
            scores: {},
            started: false,
            players: new Map(),
            advanceTimeout: null, // NEW
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

        // Initialize score to 0 for new players
        if (!(user.username in session.scores)) {
          session.scores[user.username] = 0;
        }

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
      clearAdvanceTimeout(match);

      await prisma.match.update({
        where: { id: Number(matchId) },
        data: { status: "ACTIVE" },
      });

      console.log(`🎮 Host started match ${matchId}`);

      // Fetch the 5 questions assigned to this match from the database
      const matchQuestions = await prisma.matchQuestion.findMany({
        where: { matchId: Number(matchId) },
        include: { question: true },
        orderBy: { order: 'asc' } // Maintain the order (1-5)
      });

      if (matchQuestions.length === 0) {
        socket.emit("error", { message: "No questions assigned to this match" });
        return;
      }

      // Map to the format expected by the game
      match.questions = matchQuestions.map(mq => ({
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
        index: match.questionIndex, // Send 0-based index, frontend will add 1 for display
        total: match.questions.length,
        q: current.q,
        options: current.options,
        timeLimit: (match.timeLimit || 10) * 1000, // Convert seconds to ms
      });
    });

    // ---------------- SUBMIT ANSWER ----------------
    socket.on("submitAnswer", ({ matchId, answer, elapsedTimeMs }) => {
      const match = activeMatches.get(matchId);
      if (!match || !match.started) return;

      const question = match.questions?.[match.questionIndex];
      if (!question) return;

      // Check if this player already answered this question
      if (!match.answeredPlayers) match.answeredPlayers = new Set();
      if (match.answeredPlayers.has(socket.username)) {
        console.log(`⚠️ ${socket.username} already answered this question`);
        return;
      }
      match.answeredPlayers.add(socket.username);

      const correct =
        (answer ?? "").trim().toLowerCase() === question.answer.toLowerCase();

      // Time-based scoring formula (using match's timeLimit)
      const maxTimeMs = (match.timeLimit || 10) * 1000;
      const timeFactor = Math.max(0, 1 - (elapsedTimeMs || 0) / maxTimeMs);
      const points = correct ? Math.round(1 + 4 * timeFactor) : 0;

      match.scores[socket.username] =
        (match.scores[socket.username] || 0) + points;

      console.log(`📊 ${socket.username}: ${correct ? 'Correct' : 'Wrong'} (+${points} pts) - Total: ${match.scores[socket.username]}`);

      // Emit answer result to the specific player
      io.to(`match-${matchId}`).emit("answerResult", {
        username: socket.username,
        correct,
        points,
        correctAnswer: question.answer,
      });

      // Emit updated scores to ALL players
      emitPlayers(io, matchId);

      // Log progress but let timer run to show leaderboard
      const totalPlayers = match.players.size;
      const answeredCount = match.answeredPlayers.size;
      console.log(`📝 Answered: ${answeredCount}/${totalPlayers} for question ${match.questionIndex + 1}`);

      // Let the timer run out to show the between-question leaderboard
      // Don't advance immediately even if all players answered
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
