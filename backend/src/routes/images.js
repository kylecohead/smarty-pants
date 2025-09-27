import { Router } from "express";
import multer from "multer";
import path from "path";

const router = Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Static serve will be done in index.js (not here)
// Upload endpoint
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({
    message: "File uploaded successfully",
    fileUrl: `/uploads/${req.file.filename}`,
  });
});

export default router;
