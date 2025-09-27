// backend/src/index.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";




const prisma = new PrismaClient();


const app = express();
app.use(cors());
app.use(express.json());




app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


//Use authentication routes
app.use("/auth", authRoutes);


//Use image upload routes
import imageRoutes from "./routes/images.js";
app.use("/api", imageRoutes);

// static serve (so /uploads/<file> works)
app.use("/uploads", express.static("uploads"));
//===========================================================





// Middleware to check JWT ===========================================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // use ACCESS_TOKEN_SECRET here (not JWT_SECRET) to be consistent
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
//====================================================================


// Get the current users info==================================
app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }, // now works
      select: { id: true, username: true, email: true, avatarUrl: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

//============================================================


app.listen(3000, () => {
  console.log("🚀 Backend running on http://localhost:3000");
});
