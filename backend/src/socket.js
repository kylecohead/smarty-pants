import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * In-memory runtime session store
 * key: matchId → { hostId, questionIndex, scores: {}, started, players: Map<socketId, { userId, username, avatarUrl }> }
 */
const activeMatches = new Map();

// Example fallback questions (replace with DB fetch)
const QUESTIONS = [
  { q: "2 + 2?", options: ["3", "4"], answer: "4" },
  { q: "Capital of France?", options: ["Rome", "Paris"], answer: "Paris" },
  { q: "Water freezes at?", options: ["0°C", "100°C"], answer: "0°C" },
];

// Broadcast current match state to all sockets in room
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


// Send next question or end
function sendQuestion(io, matchId) {
  const match = activeMatches.get(matchId);
  if (!match) return;

  const question = QUESTIONS[match.questionIndex];
  if (!question) {
    io.to(`match-${matchId}`).emit("matchEnded", { scores: match.scores });
    console.log(`🏁 Match ${matchId} ended`);
    activeMatches.delete(matchId);
    prisma.match.update({
      where: { id: Number(matchId) },
      data: { status: "FINISHED" },
    }).catch(console.error);
    return;
  }

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

    // Remove from in-memory list
    match.players.delete(socket.id);

    // Update DB
    await prisma.matchPlayer.updateMany({
      where: { matchId: Number(matchId), userId },
      data: { connected: false },
    });

    // Notify everyone still connected
    emitPlayers(io, matchId);

    // Handle host leaving
    if (match.hostId === userId) {
      await prisma.match.update({
        where: { id: Number(matchId) },
        data: { status: "PAUSED" },
      });
      io.to(`match-${matchId}`).emit("matchPaused");
    }

    // Clean up if empty
    if (match.players.size === 0) {
      activeMatches.delete(matchId);
      await prisma.match.update({
        where: { id: Number(matchId) },
        data: { status: "FINISHED" },
      });
      console.log(`🧹 Cleared empty match ${matchId}`);
    }
  } catch (err) {
    console.error("❌ Error during player leave:", err.message);
  }
}

//  MAIN INITIALIZER
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

        //  Verify JWT and get user info
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

        // Ensure in memory session exists
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

        // Join socket room + store metadata
        socket.join(`match-${matchId}`);
        socket.userId = userId;
        socket.username = user.username;
        socket.avatarUrl = user.avatarUrl;
        socket.matchId = matchId;

        // Prevent duplicate connections (same userId)
        const session = activeMatches.get(matchId);
        for (const [sid, p] of session.players) {
        if (p.userId === userId) {
            session.players.delete(sid);
        }
        }

        // Register in-memory player
        session.players.set(socket.id, {
        userId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        });

        // Non-blocking DB update (async, don’t await)
        prisma.matchPlayer
        .upsert({
            where: { matchId_userId: { matchId: Number(matchId), userId } },
            update: { connected: true },
            create: { matchId: Number(matchId), userId },
        })
        .catch(console.error);

        // Send player list to the joining socket instantly
        const players = [...session.players.values()].map((p) => ({
        userId: p.userId,
        username: p.username,
        avatarUrl: p.avatarUrl,
        score: session.scores[p.username] || 0,
        }));
        socket.emit("playersUpdate", { matchId, players });

        // Broadcast to everyone else
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

      io.to(`match-${matchId}`).emit("matchStarted");
      sendQuestion(io, matchId);
    });

    // ---------------- SUBMIT ANSWER ----------------
    socket.on("submitAnswer", ({ matchId, answer }) => {
      const match = activeMatches.get(matchId);
      if (!match || !match.started) return;

      const question = QUESTIONS[match.questionIndex];
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

      // Advance to next question after 2 seconds
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
      await handlePlayerLeave(io, socket, socket.matchId, false);
    });

  });

  console.log("🎯 Socket.IO hybrid setup complete");
  return io;
}
