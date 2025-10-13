import { Router } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = Router();

// GET current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
       select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        gamesPlayed: true,
        highScore: true,
        wins: true,
        memberSince: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("❌ GET /me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE current user
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { username, password, avatarUrl } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (password) {
      const hashed = await bcrypt.hash(password, 12);
      updateData.password = hashed;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, username: true, email: true, avatarUrl: true },
    });

    res.json({ user });
  } catch (err) {
    console.error("❌ PUT /me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user match history
router.get('/me/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20), 100); // Limit the number of historical matches to between 20 and 100

    // Get the user's recent match-player rows (score, category, placement, date played)
    const myRows = await prisma.matchPlayer.findMany({
      where: { userId },
      orderBy: { joinedAt: 'desc' },
      take: limit,
      select: {
        matchId: true,
        score: true,
        joinedAt: true,
        match: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            startedAt: true,
            finishedAt: true,
            // Traverse Match -> MatchQuestion -> Question to collect category
            questions: {
              take: 1,
              orderBy: { order: 'asc' },
              select: {
                question: { select: { category: true } }
              }
            }
          }
        }
      }
    });

    if (myRows.length === 0) {
      return res.json({ history: [] });
    }

    // Compute placement from all player's scores in each match
    const matchIds = Array.from(new Set(myRows.map(r => r.matchId)));
    const peers = await prisma.matchPlayer.findMany({
      where: { matchId: { in: matchIds } },
      select: { matchId: true, userId: true, score: true }
    });

    const scoresByMatch = new Map();
    for (const mid of matchIds) scoresByMatch.set(mid, []); 
    for (const p of peers) scoresByMatch.get(p.matchId).push(p.score);
    for (const [mid, arr] of scoresByMatch) arr.sort((a, b) => b - a); // Sort all the scores

    // Derive category of game
    function deriveCategory(matchRow) {
      const q0 = matchRow?.questions?.[0]?.question;
      return (q0?.category && String(q0.category).trim()) || "Unknown";
    }

    // Build response object
    const history = myRows.map(r => {
      const descScores = scoresByMatch.get(r.matchId) || [];
      const placement = 1 + descScores.findIndex( s => s === r.score);
      const date = r.match.createdAt;
      const category = deriveCategory(r.match);

      return {
        id: r.matchId,
        date,
        category,
        score: r.score,
        placement
      };
    });

    res.json( { history });
  } catch (err) {
    console.error('Failed to load match history:', err);
    res.status(500).json({ error: 'Failed to load match history' });
  }
});

// SEARCH users by username
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const searchTerm = q.trim().toLowerCase();
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: searchTerm,
          mode: 'insensitive'
        },
        id: {
          not: req.user.id // Exclude current user from search results
        }
      },
      select: {
        id: true,
        username: true
      },
      orderBy: {
        username: 'asc'
      },
      take: 10 // Limit to 10 results
    });

    res.json({ users });
  } catch (err) {
    console.error("❌ GET /search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Increment games played once a match has ended
router.post('/:id/increment-games', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        gamesPlayed: {
          increment: 1
        }
      }
    });
    
    res.json({ success: true, gamesPlayed: updatedUser.gamesPlayed });
  } catch (error) {
    console.error('Failed to increment games played:', error);
    res.status(500).json({ error: 'Failed to update games played count' });
  }
});

// Increment wins when a user wins a match
router.post('/:id/increment-wins', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        wins: {
          increment: 1
        }
      }
    });

    res.json({ success: true, wins: updatedUser.wins });
  } catch (error) {
    console.error("Failed to increment wins:", error);
    res.status(500).json({ error: 'Failed to update wins count' });
  }
});

// Update high score when a new high score is achieved
router.post('/:id/update-highscore', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);
  const newScore = parseInt(req.body.score);

  try {
    // First get the current user to check existing high score
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { highScore: true }
    });

    // Update if a new high score has been achieved
    if (!user.highScore || newScore > user.highScore) {
      const updatedUser = await prisma.user.update({
        where : { id: userId },
        data: {
          highScore: newScore
        }
      });

      res.json({
        success: true,
        highScore: updatedUser.highScore,
        isNewRecord: true
      });
    } else {
      res.json({
        success: true,
        highScore: user.highScore,
        isNewRecord: false
      });
    }
  } catch (error) {
    console.error("Failed to update high score:", error); 
    res.status(500).json({ error: 'Failed to update high score' });
  }
});

// Determine leaderboard for the top best players in the database
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50); // Limit the number of best players to return

    const players = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        highScore: true,
      },
      orderBy: [
        { highScore: 'desc' }, // Initially sort using best score
        { createdAt: 'asc' },  // Earlier account first as a tiebreaker
      ],
      take: limit,             // Select only the top 'limit' number of players
    });

    // Determine the leaders 
    const leaderboard = players.map((p, i) => ({
      rank: i + 1,
      id: p.id,
      name: p.username,
      highScore: p.highScore ?? 0, 
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Failed to load leaderboard', error);
    res.status(500).json({ error: 'Failed to load leaderboard' })
  }
});

export default router;
