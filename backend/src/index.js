// backend/src/index.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());




app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


//Use authentication routes
app.use("/auth", authRoutes);

app.listen(3000, () => {
  console.log("🚀 Backend running on http://localhost:3000");
});
