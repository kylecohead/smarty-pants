import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 🎨 Brand heading
function Heading() {
  const letters = [
    { t: "S", c: "text-smart-green" },
    { t: "m", c: "text-smart-orange" },
    { t: "a", c: "text-smart-light-blue" },
    { t: "r", c: "text-smart-light-pink" },
    { t: "t", c: "text-smart-green" },
    { t: "i", c: "text-smart-red" },
    { t: "e", c: "text-smart-purple" },
    { t: " ", c: "" },
    { t: "P", c: "text-smart-light-blue" },
    { t: "a", c: "text-smart-yellow" },
    { t: "n", c: "text-smart-green" },
    { t: "t", c: "text-smart-pink" },
    { t: "s", c: "text-smart-dark-blue" },
  ];

  return (
    <h1 className="text-center font-heading text-5xl sm:text-6xl font-black leading-none mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}>
      {letters.map((l, i) => (
        <span key={i} className={l.c}>
          {String(l.t).toUpperCase()}
        </span>
      ))}
    </h1>
  );
}

const colors = {
  darkBlue: "#0A2442",
  ink: "#E8F1FF",
  accentA: "#32D399",
  accentB: "#6EC5FF",
  accentC: "#FFC857",
  muted: "#94A3B8",
};

export default function JoinGameLobby() {
  const navigate = useNavigate();

  const [joinInput, setJoinInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [publicGames, setPublicGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  // ✅ Correct API base (notice the /api suffix)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // 🔄 Fetch public games from API
  const fetchPublicGames = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoadingGames(false);
        return;
      }
      const res = await fetch(`${API_URL}/matches?isPublic=true&status=LOBBY`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPublicGames(data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch public games:", err);
    } finally {
      setLoadingGames(false);
    }
  };

  // 🔄 Initial fetch + polling for real-time updates
  useEffect(() => {
    fetchPublicGames();

    // Poll every 2 seconds for updates
    const pollInterval = setInterval(() => {
      fetchPublicGames();
    }, 2000);

    // Also refresh when window regains focus
    const handleFocus = () => {
      fetchPublicGames();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [API_URL]);

  // 🔍 Validate + clean join code
  const extractJoinCode = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    return /^\d+$/.test(trimmed) ? trimmed : null;
  };

  // ✅ Join game handler
  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const code = extractJoinCode(joinInput);
    if (!code) {
      setInputError("Please enter a valid numeric join code.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setInputError("You must log in first.");
        return;
      }

      // ✅ FIXED ENDPOINT: /api/matches/:id
      const res = await fetch(`${API_URL}/matches/${code}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const match = await res.json();
        console.log("✅ Joined match:", match);
        navigate(`/game/join/${match.id || code}`);
      } else if (res.status === 404) {
        setInputError("No game found with that code.");
      } else if (res.status === 401) {
        setInputError("Unauthorized. Please log in again.");
      } else {
        const errText = await res.text();
        console.error("❌ Backend error:", errText);
        setInputError("Failed to find the game. Try again.");
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setInputError("Network error. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setJoinInput(e.target.value);
    if (inputError) setInputError("");
  };

  // 🔎 Filter public games
  const filteredGames = useMemo(() => {
    return publicGames.filter((game) => {
      const matchesSearch =
        !searchQuery ||
        game.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.host?.username?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !categoryFilter ||
        game.category?.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesDifficulty =
        !difficultyFilter ||
        game.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [publicGames, searchQuery, categoryFilter, difficultyFilter]);

  const formatStartTime = (isoString) => {
    if (!isoString) return "Starting now";
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((date - now) / 60000);
    if (diffMinutes < 60) return `Starts in ${diffMinutes}m`;
    if (diffMinutes < 1440)
      return `Starts in ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-smart-light-blue">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Back to Game Menu */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-white transition-colors"
        >
          ← Game Menu
        </button>

        {/* Heading */}
        <div className="text-center mb-8">
          <Heading />
          <div className="inline-block rounded-2xl bg-smart-orange px-6 py-3 mt-4">
            <h2 className="text-white font-heading text-2xl font-bold tracking-wider">
              ~JOIN A GAME~
            </h2>
          </div>
        </div>

        {/* Join by Code */}
        <div className="rounded-3xl border border-orange-400/50 bg-orange-500/40 shadow-xl backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-smart-orange mb-6 text-center">
            Join with Code
          </h2>
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <input
              id="joinInput"
              type="text"
              value={joinInput}
              onChange={handleInputChange}
              placeholder="Enter match ID (e.g., 12)"
              className="w-full rounded-xl bg-orange-500/20 border-2 border-orange-400/40 text-white placeholder:text-orange-200/70 px-6 py-4 text-lg outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
            {inputError && (
              <p className="text-sm text-red-400 mt-2 font-medium">
                {inputError}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl px-6 py-4 bg-smart-orange text-white text-lg font-bold hover:opacity-90 transition shadow-lg"
            >
              Join Game
            </button>
          </form>
        </div>

        {/* Public Games */}
        <div className="rounded-3xl border border-pink-400/50 bg-pink-500/40 shadow-xl backdrop-blur-sm p-8 space-y-6">
          <h2 className="text-2xl font-bold text-smart-pink mb-4 text-center">
            Public Games
          </h2>

          {/* Search Filter */}
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-pink-500/20 border-2 border-pink-400/40 text-white placeholder:text-pink-200/70 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
          />

          {loadingGames ? (
            <p className="text-center text-pink-200/80 text-lg">
              Loading public games...
            </p>
          ) : filteredGames.length === 0 ? (
            <p className="text-center text-pink-200/80 text-lg">
              No public games available.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredGames.map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl border-2 border-pink-400/30 bg-pink-500/20 p-6 hover:border-pink-400/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-smart-pink text-lg mb-2">
                        {g.title}
                      </h3>
                      <p className="text-sm text-pink-200/70 mb-1">
                        Host: @{g.host?.username || "unknown"}
                      </p>
                      <p className="text-sm text-pink-200/70 mb-1">
                        {g.category || "General"} • {g.timeLimit || 10}s per
                        question
                      </p>
                      <p className="text-sm text-pink-200/60">
                        {g.players?.length || 0}/{g.maxPlayers || 5} players
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/lobby/${g.id}`)}
                      className="rounded-xl px-5 py-3 bg-smart-pink text-white text-base font-bold hover:opacity-90 transition shadow-lg"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
