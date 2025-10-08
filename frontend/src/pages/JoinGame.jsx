/**
 * NINA
 * PAGE: Join Game (spec #6)
 * Displays match details and allows player to join.
 * "Join Game" -> /lobby/:matchId
 * Back -> /game
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

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

const scoringLabels = {
  classic: "Classic (1 pt / correct)",
  speed: "Speed Bonus",
  streak: "Streaks",
};

const categoryBackgrounds = {
  general: backGeneral,
  science: backScience,
  history: backHistory,
  sports: backSports,
  culture: backCulture,
};

function SectionTitle({ children, color }) {
  return (
    <h3 className="text-lg font-semibold tracking-wide mb-2" style={{ color }}>
      {children}
    </h3>
  );
}

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
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        // Use API service with session cookie authentication
        const data = await api.getMatch(matchId);
        setMatch(data.match || data);
      } catch (err) {
        console.error(err);
        if (err.message === "Not authenticated") {
          setError("Unauthorized. Please log in again.");
        } else {
          setError("Unable to load match details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId]);

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen text-white text-xl"
        style={{ backgroundColor: colors.darkBlue }}
      >
        Loading game...
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
          ← Back
        </button>
      </div>
    );

  const bgImage =
    categoryBackgrounds[match.category?.toLowerCase?.()] || backGeneral;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.darkBlue }}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-white transition-colors"
        >
          ← Back
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-6 sm:p-8">
          <div className="flex justify-center">
            <Heading />
          </div>

          <div className="text-center mt-2">
            <h2 className="text-smart-red font-heading text-xl font-bold tracking-wider">
              ~JOIN GAME~
            </h2>
          </div>

          {/* Game title */}
          <div className="flex justify-center mt-4">
            <div className="w-full max-w-md text-center rounded-xl bg-white/10 border border-white/20 text-white px-4 py-3 text-lg font-semibold">
              {match.title || "Untitled Match"}
            </div>
          </div>

          {/* Details */}
          <div className="mt-6">
            <SectionTitle color={colors.accentA}>Game Details</SectionTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                  match.isPublic
                    ? "bg-emerald-500 text-black"
                    : "bg-amber-500 text-black"
                }`}
              >
                {match.isPublic ? "🌍 Public" : "🔒 Private"}
              </div>
              <div className="rounded-2xl px-4 py-2 text-sm font-medium bg-white/10 text-white">
                👥 {match.currentPlayers?.length || 1}/{match.maxPlayers || 6}{" "}
                Players
              </div>
              <div className="rounded-2xl px-4 py-2 text-sm font-medium bg-white/10 text-white">
                👑 Host: @{match.host?.username || "unknown"}
              </div>
            </div>

            {/* Current Players */}
            <div className="mt-4">
              <label className="block text-white/90 text-sm mb-2">
                Current Players
              </label>
              <div className="flex -space-x-3">
                {match.currentPlayers?.map((p) => (
                  <div key={p.id} className="relative">
                    <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-xs ring-2 ring-[#0A2442] shadow">
                      {p.username.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                ))}
                {Array.from({
                  length:
                    (match.maxPlayers || 6) -
                    (match.currentPlayers?.length || 1),
                }).map((_, i) => (
                  <div key={i} className="relative">
                    <div className="w-9 h-9 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center text-xs text-white/30 ring-2 ring-[#0A2442]">
                      ?
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Mode */}
          <div className="mt-8">
            <SectionTitle color={colors.accentB}>Game Mode</SectionTitle>
            <div className="relative mt-3 rounded-2xl border border-white/10 bg-white/5 p-6 h-32">
              <div
                className="absolute inset-0 rounded-2xl bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${bgImage})` }}
              />
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm text-white/60 mb-1">Mode</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">
                    {match.category || "General Knowledge"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div className="mt-8">
            <SectionTitle color={colors.accentC}>Game Settings</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Per-question timer
                </label>
                <div className="text-2xl font-bold text-white">
                  {match.secPerQ || 30}s
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Scoring model
                </label>
                <div className="text-lg font-semibold text-white">
                  {scoringLabels[match.scoring] || "Classic"}
                </div>
              </div>
            </div>
          </div>

          {/* Join button */}
          <div className="mt-8 flex justify-center">
            <Link
              to={`/lobby/${matchId}`}
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(
                    "questionDurationSeconds",
                    String(match.secPerQ || 30)
                  );
                }
              }}
              className="rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg bg-smart-red hover:opacity-80 text-white transition-opacity"
            >
              Join Game
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs" style={{ color: colors.muted }}>
          You're invited to join this game!
        </p>
      </div>
    </div>
  );
}
