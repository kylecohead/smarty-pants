import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

// --- SIGNUP ---
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashed, role: "USER" },
    });

    // Store user info in session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    res.json({ 
      success: true, 
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
  const { identifier, password, rememberMe } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  // Store user info in session
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  // Extend session duration if "Remember me" is checked
  if (rememberMe) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  } else {
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours (default)
  }

  res.json({ 
    success: true, 
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    rememberMe: rememberMe || false
  });
});

// --- LOGOUT ---
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    
    res.clearCookie("smartie.sid"); // Clear the session cookie
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// --- GET CURRENT USER ---
router.get("/me", authMiddleware, (req, res) => {
  res.json({ 
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    }
  });
});

export default router;
