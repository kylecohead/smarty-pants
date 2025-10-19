import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getActiveMatchesSummary, adminKickPlayer, adminEndMatch } from "../socket.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

function requireAdmin(req, res, next) {
  const role = req.user?.role || null;
  if (role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// GET /api/admin/matches - list active runtime matches
router.get("/matches", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const summary = getActiveMatchesSummary();

    // Enrich with DB data (title, createdAt) when available
    const enrichedRuntime = await Promise.all(
      summary.map(async (m) => {
        try {
          const db = await prisma.match.findUnique({
            where: { id: Number(m.matchId) },
            select: { id: true, title: true, createdAt: true, category: true, scheduledStartAt: true },
          });
          return { ...m, title: db?.title || null, createdAt: db?.createdAt || null, category: db?.category || null, scheduledStartAt: db?.scheduledStartAt || null };
        } catch (e) {
          return m;
        }
      })
    );

    // Also include scheduled but not-yet-started matches from DB (not present in runtime)
    const scheduledMatches = await prisma.match.findMany({
      where: { scheduledStartAt: { not: null }, status: { not: "FINISHED" } },
      select: { id: true, title: true, category: true, scheduledStartAt: true, hostId: true },
    });

    const enrichedScheduled = await Promise.all(
      scheduledMatches.map(async (m) => {
        // Only include if not already in runtime summary
        if (summary.find((s) => Number(s.matchId) === m.id)) return null;
        // Only include scheduled matches that have at least one connected player
        const players = await prisma.matchPlayer.findMany({ where: { matchId: m.id, connected: true }, select: { userId: true } });
        if (!players || players.length === 0) return null;
        return {
          matchId: String(m.id),
          hostId: m.hostId,
          hostUsername: null,
          status: "scheduled",
          started: false,
          questionIndex: 0,
          totalQuestions: 0,
          players: players.map((p) => ({ userId: p.userId })),
          title: m.title,
          createdAt: null,
          category: m.category,
          scheduledStartAt: m.scheduledStartAt,
        };
      })
    );

    const enriched = [...enrichedRuntime, ...enrichedScheduled.filter(Boolean)];

    res.json({ matches: enriched });
  } catch (err) {
    console.error("GET /api/admin/matches error:", err);
    res.status(500).json({ error: "Failed to fetch active matches" });
  }
});

// POST /api/admin/matches/:id/kick - kick a userId from a match
router.post("/matches/:id/kick", authMiddleware, requireAdmin, async (req, res) => {
  const matchId = req.params.id;
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId required" });

  try {
    const result = await adminKickPlayer(matchId, userId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("POST /api/admin/matches/:id/kick error:", err);
    res.status(500).json({ error: err.message || "Failed to kick player" });
  }
});

// POST /api/admin/matches/:id/end - end match immediately (no stats saved)
router.post("/matches/:id/end", authMiddleware, requireAdmin, async (req, res) => {
  const matchId = req.params.id;
  try {
    // Try to end an in-memory active match first
    try {
      const result = await adminEndMatch(matchId);
      return res.json({ success: true, ...result });
    } catch (err) {
      // If the socket helper couldn't find an active match, fall back to DB-only scheduled matches
      console.warn(`adminEndMatch socket helper failed for ${matchId}:`, err.message);
      // Try to mark the DB match as finished (scheduled but not started)
      try {
        await prisma.match.update({
          where: { id: Number(matchId) },
          data: { status: "FINISHED", completed: false, finishedAt: new Date() },
        });
        return res.json({ success: true, ended: true, note: "Marked scheduled match finished in DB" });
      } catch (dbErr) {
        console.error("Failed to mark scheduled match finished in DB:", dbErr);
        return res.status(500).json({ error: dbErr.message || "Failed to end match" });
      }
    }
  } catch (err) {
    console.error("POST /api/admin/matches/:id/end error:", err);
    res.status(500).json({ error: err.message || "Failed to end match" });
  }
});

export default router;
