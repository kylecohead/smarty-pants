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
    const enriched = await Promise.all(
      summary.map(async (m) => {
        try {
          const db = await prisma.match.findUnique({
            where: { id: Number(m.matchId) },
            select: { id: true, title: true, createdAt: true, category: true },
          });
          return { ...m, title: db?.title || null, createdAt: db?.createdAt || null, category: db?.category || null };
        } catch (e) {
          return m;
        }
      })
    );

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
    const result = await adminEndMatch(matchId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("POST /api/admin/matches/:id/end error:", err);
    res.status(500).json({ error: err.message || "Failed to end match" });
  }
});

export default router;
