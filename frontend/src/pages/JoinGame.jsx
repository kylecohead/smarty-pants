/**
 * PAGE: Join Game - Browse Public Games
 * Displays all public games available to join
 * Shows games in LOBBY status that are public
 * Back -> /game
 */

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import backGeneral from "../assets/backGeneral.jpg";
import backScience from "../assets/backScience.jpg";
import backHistory from "../assets/backHistory.jpg";
import backSports from "../assets/backSports.jpg";
import backCulture from "../assets/backCulture.jpg";

const colors = {
  darkBlue: "#0A2442",
  ink: "#E8F1FF",
  accentA: "#32D399",
  accentB: "#6EC5FF",
  accentC: "#FFC857",
  muted: "#94A3B8",
};

const categoryBackgrounds = {
  general: backGeneral,
  science: backScience,
  history: backHistory,
  sports: backSports,
  culture: backCulture,
};

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
    <h1 className="text-center font-heading text-4xl sm:text-5xl font-black leading-none">
      {letters.map((l, i) => (
        <span key={i} className={l.c}>
          {String(l.t).toUpperCase()}
        </span>
      ))}
    </h1>
  );
}

export default function JoinGame() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const base =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ""
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : window.location.origin.replace(/\/$/, "");
  const API_URL = `${base}/api`;

  useEffect(() => {
    const fetchPublicGames = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("You must be logged in to view public games.");
          setLoading(false);
          return;
        }
        // Fetch public games in LOBBY status
        const res = await fetch(
          `${API_URL}/matches?isPublic=true&status=LOBBY`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to load public games.");
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load public games.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicGames();
  }, []);

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen text-white text-xl"
        style={{ backgroundColor: colors.darkBlue }}
      >
        Loading public games...
      </div>
    );

  if (error)
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen text-white"
        style={{ backgroundColor: colors.darkBlue }}
      >
        <p className="mb-4 text-red-400">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-white transition-colors"
        >
          ← Game Menu
        </button>
      </div>
    );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.darkBlue }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-white transition-colors"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-center mb-3">
            <Heading />
          </div>
          <h2 className="text-center text-smart-red font-heading text-xl font-bold tracking-wider">
            ~PUBLIC GAMES~
          </h2>
          <p className="text-center text-white/60 mt-2">
            Join an open game or create your own
          </p>
        </div>

        {/* Games List */}
        {matches.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-8 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Public Games Available
            </h3>
            <p className="text-white/60 mb-6">
              Be the first to create a public game!
            </p>
            <Link
              to="/create"
              className="inline-block rounded-2xl px-6 py-3 text-lg font-semibold shadow-lg bg-smart-green hover:opacity-80 text-white transition-opacity"
            >
              Create Game
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {matches.map((match) => {
              const bgImage =
                categoryBackgrounds[match.category?.toLowerCase?.()] ||
                backGeneral;
              const currentPlayers = match.players?.length || 0;
              const maxPlayers = match.maxPlayers || 5;

              return (
                <div
                  key={match.id}
                  className="rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all hover:scale-[1.02]"
                >
                  {/* Category Banner */}
                  <div
                    className="relative h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A2442]/80" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                        {match.title || "Untitled Match"}
                      </h3>
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="p-6">
                    {/* Category & Stats */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="rounded-xl px-3 py-1 text-sm font-medium bg-smart-purple/20 text-smart-purple border border-smart-purple/30">
                        {match.category || "General"}
                      </span>
                      <span className="rounded-xl px-3 py-1 text-sm font-medium bg-white/10 text-white">
                        ⏱️ {match.timeLimit || 10}s
                      </span>
                    </div>

                    {/* Players */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex -space-x-2">
                        {match.players?.slice(0, 4).map((p) => (
                          <div key={p.id} className="relative">
                            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs ring-2 ring-[#0A2442] shadow font-medium">
                              {p.user?.username?.slice(0, 2).toUpperCase() ||
                                "?"}
                            </div>
                          </div>
                        ))}
                        {currentPlayers > 4 && (
                          <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs ring-2 ring-[#0A2442] shadow">
                            +{currentPlayers - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-white/80 text-sm font-medium">
                        {currentPlayers}/{maxPlayers} players
                      </span>
                      {currentPlayers >= maxPlayers && (
                        <span className="text-red-400 text-xs font-semibold">
                          FULL
                        </span>
                      )}
                    </div>

                    {/* Host */}
                    <div className="mb-4 text-sm text-white/60">
                      👑 Hosted by{" "}
                      <span className="text-white font-medium">
                        @{match.host?.username || "unknown"}
                      </span>
                    </div>

                    {/* Join Button */}
                    <Link
                      to={`/lobby/${match.id}`}
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          sessionStorage.setItem(
                            "questionDurationSeconds",
                            String(match.timeLimit || 10)
                          );
                        }
                      }}
                      className={`block text-center rounded-2xl px-6 py-3 text-lg font-semibold shadow-lg transition-opacity ${
                        currentPlayers >= maxPlayers
                          ? "bg-gray-500 opacity-50 cursor-not-allowed pointer-events-none"
                          : "bg-smart-red hover:opacity-80"
                      } text-white`}
                    >
                      {currentPlayers >= maxPlayers ? "Game Full" : "Join Game"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Game CTA */}
        {matches.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-white/60 mb-4">Don't see a game you like?</p>
            <Link
              to="/create"
              className="inline-block rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg bg-smart-green hover:opacity-80 text-white transition-opacity"
            >
              Create Your Own Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
