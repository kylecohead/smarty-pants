/**
 * AMY
 * PAGE: Game Lobby (spec #6)
 * Buttons:
 *  - Play Game -> /game/play
 *  - Show Round Number -> /lobby/round (modal)
 * Back: to previous (Create/Join)
 */
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import catImage from "../assets/cat.jpg";
import { getSocket, closeSocket } from "../services/socket";
import { api } from "../services/api";

const colors = {
  darkBlue: "#0A2442",
  accentA: "#32D399",
  accentB: "#6EC5FF",
  accentC: "#FFC857",
  muted: "#94A3B8",
};

export default function Lobby() {
  const navigate = useNavigate();
  const { matchId } = useParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);

  // Fetch current user
  useEffect(() => {
    (async () => {
      try {
        const data = await api.getCurrentUser();
        setCurrentUser(data.user);
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
      }
    })();
  }, []);

  // Socket setup + join match
  useEffect(() => {
    if (!matchId) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You must be logged in to join a match.");
      return;
    }

    // Create a new socket instance
    const socket = getSocket(token);
    socketRef.current = socket;

    // Attach listeners
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      setSocketConnected(true);
      socket.emit("joinMatch", { matchId, token });
    });

    socket.on("playersUpdate", ({ players }) => {
      console.log("👥 playersUpdate:", players);
      setPlayers(players);
    });

    // socket.on("matchStarted", ({ firstQuestion }) => {
    //   console.log("🏁 Match started!");
    //   navigate(`/game/play/${matchId}`, { state: { firstQuestion } });
    // });
    socket.on("matchStarted", () => {
      console.log("🏁 Match started!");
      navigate(`/game/play/${matchId}`);
    });

    socket.on("matchEnded", ({ scores }) => {
      console.log("🎯 Match ended:", scores);
    });

    socket.on("matchPaused", () => {
      console.warn("⏸️ Match paused (host left)");
    });

    socket.on("hostLeft", ({ message }) => {
      console.log("👑 Host left the lobby:", message);
      alert(message);
      // Navigate back to game menu after host leaves
      navigate("/game");
    });

    socket.on("disconnect", () => {
      console.warn("⚠️ Disconnected from server");
      setSocketConnected(false);
    });

    // Connect the socket
    socket.connect();

    // Handle browser unload
    const handleBeforeUnload = () => {
      console.log("🚪 Leaving match (browser unload):", matchId);
      socket.emit("leaveMatch", { matchId });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup when component unmounts
    return () => {
      console.log("🧹 Unmounting Lobby component");

      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Only emit leaveMatch if truly leaving the game (not going to /game/play)
      const nextUrl = window.location.pathname;
      const leavingCompletely = !nextUrl.includes("/game/play");

      if (socket.connected && leavingCompletely) {
        console.log("🚪 Leaving match completely:", matchId);
        socket.emit("leaveMatch", { matchId });
        socket.disconnect();
      } else {
        console.log("🔄 Transitioning to gameplay — keeping socket alive");
      }
    };
  }, [matchId, navigate]);

  // Listen for playersUpdate
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const socket = getSocket(token);

    socket.on("playersUpdate", ({ matchId, players }) => {
      console.log("👥 Players updated:", players);
      setPlayers(players); // Update the player list in state
    });

    return () => {
      socket.off("playersUpdate");
    };
  }, []);

  // Host check
  useEffect(() => {
    if (!matchId || !currentUser) return;

    (async () => {
      try {
        const res = await api.getMatch(matchId);
        if (res.hostId && currentUser?.id) {
          setIsHost(res.hostId === currentUser.id);
        }
      } catch (err) {
        console.error("Error checking host:", err);
      }
    })();
  }, [matchId, currentUser]);

  const isLobbyFull = players.length >= 1;

  const handleStartGame = () => {
    const socket = socketRef.current;
    if (!socket) return console.warn("⚠️ No socket instance found");

    if (!socket.connected) {
      console.warn("⚠️ Socket not connected yet");
      return;
    }

    console.log("🚀 Starting match:", matchId);
    socket.emit("startMatch", { matchId });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.darkBlue }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-white font-button transition-colors"
        >
          ← Game Menu
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-8 sm:p-12">
          {/* Heading */}
          <h1 className="text-center font-heading text-6xl font-black mb-4 text-white">
            GAME LOBBY
          </h1>

          {/* Join Code Display */}
          <div className="text-center mb-8">
            <span className="text-white/60 text-sm block mb-1">
              Share this join code:
            </span>
            <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-6 py-2 text-white text-xl font-semibold tracking-wider select-all">
              {matchId}
            </div>
          </div>

          {/* Player count */}
          <div className="text-center mb-6 text-lg text-white/80">
            {socketConnected
              ? `Players: ${players.length} / 6`
              : "Connecting to server..."}
          </div>

          {/* Player grid */}
          <div className="grid grid-cols-3 gap-8 place-items-center max-w-4xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => {
              const p = players[i];
              return (
                <div
                  key={i}
                  className={`w-36 h-36 border-2 rounded-xl flex flex-col items-center justify-center ${
                    p
                      ? "border-emerald-500 bg-white/10"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  {p ? (
                    <>
                      <img
                        src={p.avatarUrl || catImage}
                        alt={p.username}
                        className="w-24 h-24 object-cover rounded-full ring-2 ring-white/20"
                      />
                      <span className="text-sm mt-2 text-white/80">
                        {p.username}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/40">Waiting...</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Host start button */}
          {isHost && (
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={handleStartGame}
                disabled={!isLobbyFull}
                className={`rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg transition-opacity ${
                  isLobbyFull
                    ? "bg-smart-red hover:opacity-80 text-white"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                }`}
              >
                Start Game
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs" style={{ color: colors.muted }}>
          Anyone entering{" "}
          <span className="text-white/70">/lobby/{matchId}</span> will auto-join
          the room.
        </p>
      </div>

      <Outlet />
    </div>
  );
}
