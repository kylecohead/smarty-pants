/**
 * NINA
 * PAGE: Join Game (spec #6)
 * "To Lobby" -> /lobby
 * Back: to Game Menu "/game"
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";

// Import background images for game modes
import backGeneral from "../assets/backGeneral.jpg";
import backScience from "../assets/backScience.jpg";
import backHistory from "../assets/backHistory.jpg";
import backSports from "../assets/backSports.jpg";
import backCulture from "../assets/backCulture.jpg";

const colors = {
  darkBlue: "#0A2442", // smart-darkblue background
  ink: "#E8F1FF", // body copy on dark
  accentA: "#32D399", // section A
  accentB: "#6EC5FF", // section B
  accentC: "#FFC857", // section C
  muted: "#94A3B8", // helpers
};

/**
 * Static game data for demonstration purposes
 * In production, this would be fetched from an API based on game ID
 * @type {Object} Game configuration and current state
 */
const gameData = {
  title: "The Trivia Night",
  isPublic: false,
  maxPlayers: 8,
  currentPlayers: 3,
  mode: {
    key: "general",
    label: "General Knowledge",
    backgroundImage: backGeneral,
  },
  secPerQ: 30,
  scoring: "speed",
  requireCorrectAll: false,
  host: "nina",
  invitedPlayers: ["alex", "mason", "sara"],
};

/**
 * Human-readable labels for different scoring models
 * Maps scoring keys to display-friendly descriptions
 * @type {Object<string, string>}
 */
const scoringLabels = {
  classic: "Classic (1 pt / correct)", // Standard scoring system
  speed: "Speed Bonus", // Points based on answer speed
  streak: "Streaks", // Bonus for consecutive correct answers
};

/**
 * Reusable section title component with custom color styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Title text content
 * @param {string} props.color - CSS color value for the title
 * @returns {JSX.Element} Styled section heading
 */
function SectionTitle({ children, color }) {
  return (
    <h3 className="text-lg font-semibold tracking-wide mb-2" style={{ color }}>
      {children}
    </h3>
  );
}

/**
 * Brand heading component displaying "SMARTIE PANTS" with individual letter colors
 * Creates a vibrant, playful brand identity
 * @returns {JSX.Element} Multi-colored brand heading
 */
function Heading() {
  // Each letter mapped to its corresponding brand color class
  const letters = [
    { t: "S", c: "text-smart-green" },
    { t: "m", c: "text-smart-orange" },
    { t: "a", c: "text-smart-light-blue" },
    { t: "r", c: "text-smart-light-pink" },
    { t: "t", c: "text-smart-green" },
    { t: "i", c: "text-smart-red" },
    { t: "e", c: "text-smart-purple" },
    { t: " ", c: "" }, // Space with no styling
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

/**
 * JoinGame Component - Displays game details and allows users to join an existing game
 * Shows game configuration, current players, mode details, and settings
 * Provides a "Join Game" button to proceed to the lobby
 * @returns {JSX.Element} The join game page
 */
export default function JoinGame() {
  const navigate = useNavigate(); // Hook for programmatic navigation

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.darkBlue }}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-white transition-colors"
        >
          ← Back
        </button>

        {/* Card substitute */}
        <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-center">
            <Heading />
          </div>

          {/* Subtitle */}
          <div className="flex items-center justify-center mt-2">
            <h2 className="text-smart-red font-heading text-xl font-bold tracking-wider">
              ~JOIN GAME~
            </h2>
          </div>

          {/* Game Title Display */}
          <div className="flex items-center justify-center mt-4">
            <div className="w-full max-w-md text-center rounded-xl bg-white/10 border border-white/20 text-white px-4 py-3 text-lg font-semibold">
              {gameData.title}
            </div>
          </div>

          {/* Game Details Section - Shows basic game info and current status */}
          <div className="mt-6">
            <SectionTitle color={colors.accentA}>Game Details</SectionTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                  gameData.isPublic
                    ? "bg-emerald-500 text-black"
                    : "bg-amber-500 text-black"
                }`}
              >
                {gameData.isPublic ? "🌍 Public" : "🔒 Private"}
              </div>
              <div className="rounded-2xl px-4 py-2 text-sm font-medium bg-white/10 text-white">
                👥 {gameData.currentPlayers}/{gameData.maxPlayers} Players
              </div>
              <div className="rounded-2xl px-4 py-2 text-sm font-medium bg-white/10 text-white">
                👑 Host: @{gameData.host}
              </div>
            </div>

            {/* Current Players Display - Shows avatars of joined players and empty slots */}
            <div className="mt-4">
              <label className="block text-white/90 text-sm mb-2">
                Current Players
              </label>
              <div className="flex -space-x-3">
                {/* Render current players as avatar circles with initials */}
                {gameData.invitedPlayers.map((u) => {
                  const initials = u.slice(0, 2).toUpperCase(); // Use first 2 characters as initials
                  return (
                    <div key={u} className="relative">
                      <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-xs ring-2 ring-[#0A2442] shadow">
                        {initials}
                      </div>
                    </div>
                  );
                })}
                {/* Render empty player slots as dashed circles */}
                {Array.from({
                  length: gameData.maxPlayers - gameData.currentPlayers,
                }).map((_, i) => (
                  <div key={`empty-${i}`} className="relative">
                    <div className="w-9 h-9 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center text-xs text-white/30 ring-2 ring-[#0A2442]">
                      ?
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Mode Display Section - Shows selected trivia category with background */}
          <div className="mt-8">
            <SectionTitle color={colors.accentB}>Game Mode</SectionTitle>
            <div className="relative mt-3 rounded-2xl border border-white/10 bg-white/5 p-6 h-32">
              {/* Background image overlay for visual theme of selected mode */}
              <div
                className="absolute inset-0 rounded-2xl bg-cover bg-center opacity-20"
                style={{
                  backgroundImage: gameData.mode.backgroundImage
                    ? `url(${gameData.mode.backgroundImage})`
                    : "none",
                }}
              />

              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm text-white/60 mb-1">Mode</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">
                    {gameData.mode.label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Settings Display Section - Shows timing and scoring configuration */}
          <div className="mt-8">
            <SectionTitle color={colors.accentC}>Game Settings</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Per-question timer
                </label>
                <div className="text-2xl font-bold text-white">
                  {gameData.secPerQ}s
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Scoring model
                </label>
                <div className="text-lg font-semibold text-white">
                  {scoringLabels[gameData.scoring]}
                </div>
              </div>

              {/* Advanced setting toggle - displays current state of strict mode */}
              <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium">
                    Require all answers correct to advance
                  </label>
                  <p className="text-xs text-white/60">
                    Stricter progression rules.
                  </p>
                </div>
                {/* Visual toggle switch showing current setting state */}
                <div
                  className={`w-11 h-6 rounded-full relative ${
                    gameData.requireCorrectAll
                      ? "bg-emerald-500" // Green when enabled
                      : "bg-white/20" // Gray when disabled
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                      gameData.requireCorrectAll ? "left-5" : "left-0.5"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Button - Navigate to game lobby */}
          <div className="mt-8 flex justify-center">
            <Link
              to="/lobby"
              className="rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg bg-smart-red hover:opacity-80 text-smart-white font-button transition-opacity"
            >
              Join Game
            </Link>
          </div>
        </div>

        {/* Footer helper */}
        <p className="mt-4 text-center text-xs" style={{ color: colors.muted }}>
          You're invited to join this game!
        </p>
      </div>
    </div>
  );
}
