// backend/src/test.js
import { io } from "socket.io-client";

const username = process.argv[2] || "Tester"; // pass username via CLI
const matchId = 1;

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log(`Connected as ${username} (id: ${socket.id})`);
  socket.emit("joinMatch", { matchId, username });
});

socket.on("playersUpdate", (data) => {
  console.log("Players update:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});
