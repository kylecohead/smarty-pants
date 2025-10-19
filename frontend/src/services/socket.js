import { io } from "socket.io-client";

let socket = null;

export function getSocket(token) {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    window.location.origin.replace(/\/$/, ""); // remove trailing slash

    
  if (!socket) {
    socket = io(apiUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: false,
      auth: { token },
      reconnection: true, // Enable automatic reconnection
      reconnectionAttempts: 10, // Retry up to 10 times
      reconnectionDelay: 1000, // Wait 1 second between attempts
      withCredentials: true,
    });

    // Handle reconnection
    socket.on("reconnect", () => {
      console.log("Reconnected to the server");
      if (socket.auth.token) {
        socket.emit("joinMatch", { matchId: socket.matchId, token: socket.auth.token });
      }
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
