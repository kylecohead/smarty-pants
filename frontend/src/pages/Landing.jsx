/**
 * NINA
 * PAGE: Landing (after login)
 * Heading: "SMARTIE PANTS LANDING PAGE"
 * Buttons:
 *  - Let's Play -> /game
 *  - Settings (top-right) opens /landing/settings modal
 * Back: back to Home "/"
 */
import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

// Mock data for demonstration
const mockLeaderboard = [
  { rank: 1, name: "nina", highScore: 2450, avatar: "N" },
  { rank: 2, name: "alex", highScore: 2350, avatar: "A" },
  { rank: 3, name: "mason", highScore: 2100, avatar: "M" },
  { rank: 4, name: "sara", highScore: 1950, avatar: "S" },
  { rank: 5, name: "jo", highScore: 1850, avatar: "J" },
];

const mockUser = {
  username: "nina",
  memberSince: 2022,
  avatar: "N",
  gamesPlayed: 127,
  highScore: 2450,
  wins: 89,
};

const mockNotifications = [
  { id: 1, message: "alex invited you to join their game!", time: "2 min ago" },
  { id: 2, message: "mason started a new trivia game", time: "5 min ago" },
];

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
    { t: "s", c: "text-smart-light-blue" },
  ];
  return (
    <h1 className="text-center font-heading text-3xl sm:text-4xl lg:text-5xl font-black leading-none mb-8">
      {letters.map((l, i) => (
        <span key={i} className={l.c}>
          {String(l.t).toUpperCase()}
        </span>
      ))}
    </h1>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-smart-dark-blue text-smart-white">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-smart-white font-button transition-colors"
        >
          ← Back
        </button>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-smart-white transition-colors"
            >
              🔔
              {mockNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-smart-red text-smart-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {mockNotifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm shadow-xl z-50">
                <div className="p-4">
                  <h3 className="font-button font-bold mb-3">Notifications</h3>
                  {mockNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="mb-3 p-3 bg-white/5 rounded-lg"
                    >
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-white/60 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-smart-white transition-colors"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>

          {/* Settings */}
          <Link
            to="settings"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-smart-white transition-colors"
          >
            ⚙️
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        {/* Title */}
        <Heading />

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Leaderboard & Let's Play Button */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="bg-smart-orange rounded-2xl p-6 border-4 border-smart-white">
              <h2 className="font-heading text-2xl font-bold text-smart-black mb-6 text-center">
                LEADERBOARD
              </h2>
              <div className="space-y-3">
                {mockLeaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className="flex items-center gap-4 bg-smart-black/20 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-xl font-bold text-smart-black">
                        #{player.rank}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-smart-white text-smart-black flex items-center justify-center font-bold">
                        {player.avatar}
                      </div>
                      <span className="font-button font-bold text-smart-black">
                        {player.name}
                      </span>
                    </div>
                    <div className="ml-auto font-button font-bold text-smart-black">
                      {player.highScore.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Let's Play Button */}
            <div className="flex justify-center">
              <Link
                to="/game"
                className="w-full max-w-md rounded-2xl bg-smart-red border-4 border-smart-white px-12 py-6 text-2xl font-bold text-smart-white font-button hover:opacity-80 transition-opacity shadow-2xl text-center"
              >
                LET'S PLAY!
              </Link>
            </div>
          </div>

          {/* Right Side - User Profile */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-6">
              {/* Username */}
              <div className="text-center mb-2">
                <h2 className="font-heading text-3xl font-bold text-smart-white">
                  {mockUser.username.toUpperCase()}
                </h2>
                <p className="font-button text-smart-white/60 text-lg">
                  EST. {mockUser.memberSince}
                </p>
              </div>

              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-2xl bg-smart-orange border-4 border-smart-white flex items-center justify-center">
                  <span className="font-heading text-6xl font-bold text-smart-black">
                    {mockUser.avatar}
                  </span>
                </div>
              </div>

              {/* User Stats */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="font-button text-smart-white/60 text-sm mb-1">
                      Games Played
                    </p>
                    <p className="font-heading text-2xl font-bold text-smart-green">
                      {mockUser.gamesPlayed}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="font-button text-smart-white/60 text-sm mb-1">
                      High Score
                    </p>
                    <p className="font-heading text-2xl font-bold text-smart-yellow">
                      {mockUser.highScore.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="font-button text-smart-white/60 text-sm mb-1">
                      Wins
                    </p>
                    <p className="font-heading text-2xl font-bold text-smart-light-blue">
                      {mockUser.wins}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
