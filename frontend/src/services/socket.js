import { io } from "socket.io-client";

let socket = null;

/**
 * Initializes and returns the singleton socket connection.
 * The token is optional but recommended for authenticated joins.
 */
export function getSocket(token) {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: false, // ✅ prevents auto-reconnect loops before login
      auth: { token },
    });
  }

  // ✅ Update token dynamically in case user logs in again
  if (token) socket.auth = { token };

  return socket;
}

/**
 * Disconnects and resets the socket (for logout or cleanup).
 */
export function closeSocket() {
  if (socket) {
    socket.removeAllListeners(); // ✅ clean up events
    socket.disconnect();
    socket = null;
  }
}
