import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refreshsecret";

// --- SIGNUP ---
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        username, 
        email, 
        password: hashed, 
        role: "USER",
        gamesPlayed: 0,
        highScore: 0,
        wins: 0,
        memberSince: new Date()
      },
    });

    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

    console.log(` SIGNUP: Created new tokens for user ${user.username} (ID: ${user.id})`);
    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${refreshToken.substring(0, 20)}...`);

    res.json({ 
      accessToken, 
      refreshToken, 
      role: user.role, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// --- LOGIN ---
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "30m" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

    console.log(`  LOGIN: Created new tokens for user ${user.username} (ID: ${user.id})`);
    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${refreshToken.substring(0, 20)}...`);

    res.json({ 
      accessToken, 
      refreshToken, 
      role: user.role, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// --- REFRESH ---
router.post("/refresh", (req, res) => {
  // Fix: Accept both "token" and "refreshToken" formats
  const refreshToken = req.body.refreshToken || req.body.token;
  
  if (!refreshToken) {
    console.log("REFRESH: No refresh token provided");
    return res.status(401).json({ error: "No token" });
  }

  console.log(` REFRESH: Attempting to verify refresh token: ${refreshToken.substring(0, 20)}...`);

  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) {
      console.log(`REFRESH: Token verification failed - ${err.name}: ${err.message}`);
      
      if (err.name === 'TokenExpiredError') {
        console.log(`REFRESH: Refresh token expired at ${err.expiredAt}`);
        return res.status(403).json({ error: "Refresh token expired" });
      } else if (err.name === 'JsonWebTokenError') {
        console.log(`REFRESH: Invalid refresh token format`);
        return res.status(403).json({ error: "Invalid refresh token" });
      } else {
        console.log(`REFRESH: Other JWT error: ${err.name}`);
        return res.status(403).json({ error: "Invalid refresh token" });
      }
    }

    // Fix: Longer expiry time for access token
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      ACCESS_SECRET,
      { expiresIn: "30m" }  // ← Changed from "1m" to "30m"
    );

    console.log(`REFRESH: Successfully created new access token for user ID ${user.id}`);
    console.log(`   New Access Token: ${newAccessToken.substring(0, 20)}...`);

    res.json({ accessToken: newAccessToken, role: user.role });
  });
});

// --- GET CURRENT USER ---
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`🔍 GET ME: Retrieved user info for ${user.username} (ID: ${user.id})`);
    res.json({ user });
  } catch (error) {
    console.error("❌ Error getting current user:", error);
    res.status(500).json({ error: "Failed to get current user" });
  }
});

export default router;
