import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

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
      data: { username, email, password: hashed, role: "USER" },
    });

    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

    res.json({ accessToken, refreshToken, role: user.role, id: user.id });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// --- LOGIN ---
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

  res.json({ accessToken, refreshToken, role: user.role, id: user.id });
});

// --- REFRESH ---
router.post("/refresh", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken, role: user.role });
  });
});

export default router;
