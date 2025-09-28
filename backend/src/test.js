// backend/src/test.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("✅ Connected to server with id:", socket.id);

  // Emit join *after* connection
  socket.emit("joinMatch", { matchId: 1, username: "Tester" });
});

socket.on("playersUpdate", (data) => {
  console.log("📢 Players update:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Connection error:", err.message);
});
