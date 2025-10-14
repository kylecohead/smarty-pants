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
import backgroundLanding from "../assets/background_landing.jpg";
import lobbyPhoto from "../assets/lobby_photo.jpg";
import { getSocket, closeSocket } from "../services/socket";
import { api } from "../services/api";
import ProfileCard from "../components/ProfileCard";

const colors = {
  darkBlue: "#0A2442",
  accentA: "#32D399",
  accentB: "#6EC5FF",
  accentC: "#FFC857",
  muted: "#94A3B8",
};

// Color mapping for stickman colors to hex values
const stickmanColorMap = {
  "smart-light-blue": "#6EC5FF",
  "smart-green": "#32D399",
  "smart-yellow": "#FFC857",
  "smart-orange": "#FF8C42",
  "smart-red": "#FF6B6B",
  "smart-purple": "#9B59B6",
  "smart-light-pink": "#FF9FF3",
  "smart-pink": "#E91E63",
  "smart-dark-blue": "#1A237E",
};

// Utility function to get hex color from stickman color name
const getStickmanHexColor = (colorName) => {
  return stickmanColorMap[colorName] || "#6EC5FF"; // default to light blue
};

export default function Lobby() {
  const navigate = useNavigate();
  const { matchId } = useParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [socketConnected, setSocketConnected] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);

  const socketRef = useRef(null);

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const data = await api.getCurrentUser();
      setCurrentUser(data.user);
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
    }
  };

  // Fetch match details
  const fetchMatchDetails = async () => {
    if (!matchId) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/matches/${matchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const matchData = await response.json();
        setMatchDetails(matchData);
        console.log("📋 Match details fetched:", matchData);
      } else {
        console.error("❌ Failed to fetch match details:", response.status);
      }
    } catch (err) {
      console.error("❌ Error fetching match details:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchMatchDetails();
  }, [matchId]);

  // Listen for user data refresh events from settings modal
  useEffect(() => {
    const handleUserRefresh = () => {
      console.log("🔄 Refreshing user data in lobby after settings update...");
      fetchCurrentUser();
    };

    window.addEventListener("refreshUserData", handleUserRefresh);

    return () => {
      window.removeEventListener("refreshUserData", handleUserRefresh);
    };
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
        // Save match settings (maxPlayers) and determine host
        setMaxPlayers(res.maxPlayers || 6);
        if (res.hostId && currentUser?.id) {
          setIsHost(res.hostId === currentUser.id);
        }
      } catch (err) {
        console.error("Error checking host:", err);
      }
    })();
  }, [matchId, currentUser]);

  const isLobbyFull = players.length >= (maxPlayers || 6);

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
    <div
      className="h-screen bg-smart-dark-blue text-smart-white overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundLanding})`,
      }}
    >
      {/* Header Section */}
      <div className="px-4 pt-2 pb-1">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg border-2 border-white hover:bg-white/10 text-white transition-colors px-4 py-2 font-button"
        >
          ← Game Menu
        </button>

        {/* Title */}
        <h1
          className="text-center font-heading text-4xl sm:text-5xl lg:text-6xl font-black leading-none mb-2 text-smart-pink"
          style={{
            textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)",
          }}
        >
          GAME LOBBY
        </h1>
      </div>

      {/* Main Panel Container */}
      <div className="px-4 flex-1 flex items-start">
        <div className="max-w-7xl mx-auto w-full">
          {/* Panel */}
          <div
            className="bg-[#1a237e]/70 border border-[#1a237e]/80 rounded-3xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col"
            style={{ height: "calc(100vh - 140px)" }}
          >
            {/* Panel Header - Player Count and Code */}
            <div className="relative flex justify-center items-center mb-3 flex-shrink-0">
              <div className="text-2xl text-white font-bold">
                {socketConnected
                  ? `${matchDetails?.title || "Game"}'s Players: ${
                      players.length
                    } / ${maxPlayers}`
                  : "Connecting to server..."}
              </div>
              <div className="absolute right-0 inline-block bg-smart-pink rounded-lg px-3 py-1">
                <span className="text-white text-sm font-semibold mr-2">
                  Code:
                </span>
                <span className="text-white text-sm font-bold tracking-wider select-all">
                  {matchId}
                </span>
              </div>
            </div>

            {/* Player grid */}
            <div className="flex-1 flex items-center justify-center py-2">
              <div
                className="grid gap-3 w-full max-w-4xl px-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(
                    maxPlayers,
                    6
                  )}, minmax(0,1fr))`,
                }}
              >
                {Array.from({ length: maxPlayers }).map((_, i) => {
                  const p = players[i];
                  return (
                    <div
                      key={i}
                      className={`aspect-square border-2 rounded-xl flex flex-col items-center justify-center p-2 ${
                        p
                          ? "border-emerald-500 bg-white/10"
                          : "border-white/20 bg-white/5"
                      }`}
                    >
                      {p ? (
                        <div className="w-full h-full flex flex-col">
                          {/* Player photo block with color overlay */}
                          <div className="flex-1 relative overflow-hidden rounded-lg border-8 border-white">
                            <img
                              src={lobbyPhoto}
                              alt={`${p.username}'s lobby`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log("Image failed to load:", e);
                                e.target.style.backgroundColor = "#1a237e";
                              }}
                            />
                            {/* Color overlay based on user's stickman color - more visible */}
                            <div
                              className="absolute inset-0 opacity-40"
                              style={{
                                backgroundColor: getStickmanHexColor(
                                  p.stickmanColor ||
                                    (currentUser?.id === p.userId
                                      ? currentUser?.stickmanColor
                                      : null) ||
                                    "smart-light-blue"
                                ),
                              }}
                            />
                          </div>
                          {/* Username below the photo in user color */}
                          <div className="mt-1 text-center">
                            <h3
                              className="font-heading text-xs font-bold truncate"
                              style={{
                                color: getStickmanHexColor(
                                  p.stickmanColor ||
                                    (currentUser?.id === p.userId
                                      ? currentUser?.stickmanColor
                                      : null) ||
                                    "smart-light-blue"
                                ),
                              }}
                            >
                              {p.username.toUpperCase()}
                            </h3>
                          </div>
                        </div>
                      ) : (
                        <span className="text-white text-sm sm:text-base">
                          Waiting...
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Host start button - Below panel */}
      {isHost && (
        <div className="px-4 py-4 flex justify-center">
          <button
            onClick={handleStartGame}
            disabled={!isLobbyFull}
            className={`rounded-2xl px-10 py-4 text-xl font-bold border-2 border-white text-white transition-opacity shadow-lg ${
              isLobbyFull
                ? "bg-transparent hover:bg-white/10"
                : "bg-transparent border-white/30 text-white/50 cursor-not-allowed"
            }`}
          >
            Start Game
          </button>
        </div>
      )}

      <Outlet />
    </div>
  );
}
