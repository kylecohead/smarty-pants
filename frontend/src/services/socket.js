import { io } from "socket.io-client";

let socket = null;

export function getSocket(token) {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  if (!socket) {
    socket = io(apiUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: false,
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  if (token) socket.auth = { token };
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
