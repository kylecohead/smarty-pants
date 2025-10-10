/**
 * NINA
 * PAGE: Landing (after login)
 * Heading: "SMARTIE PANTS LANDING PAGE"
 * Buttons:
 *  - Let's Play -> /game
 *  - Settings (top-right) opens /landing/settings modal
 * Back: back to Home "/"
 */
import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import ProfileCard from "../components/ProfileCard.jsx";
import backgroundLanding from "../assets/background_landing.jpg";

// Mock data for demonstration
const mockLeaderboard = [
  { rank: 1, name: "nina", highScore: 2450, avatar: "N" },
  { rank: 2, name: "alex", highScore: 2350, avatar: "A" },
  { rank: 3, name: "mason", highScore: 2100, avatar: "M" },
  { rank: 4, name: "sara", highScore: 1950, avatar: "S" },
  { rank: 5, name: "jo", highScore: 1850, avatar: "J" },
  { rank: 6, name: "kai", highScore: 1750, avatar: "K" },
  { rank: 7, name: "zoe", highScore: 1650, avatar: "Z" },
  { rank: 8, name: "ben", highScore: 1550, avatar: "B" },
  { rank: 9, name: "mia", highScore: 1450, avatar: "M" },
  { rank: 10, name: "leo", highScore: 1350, avatar: "L" },
];

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
    <h1
      className="text-center font-heading text-4xl sm:text-5xl lg:text-6xl font-black leading-none mb-4"
      style={{
        textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)",
      }}
    >
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardStart, setLeaderboardStart] = useState(0);

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          setError(data.error || "Failed to fetch user");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Handle loading and error states
  if (loading) {
    return <p>Loading user data...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!user) {
    return <p>No user data available</p>;
  }

  return (
    <div
      className="h-screen bg-smart-dark-blue text-smart-white overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundLanding})`,
      }}
    >
      {/* Header Section - Title, Notifications, and Settings */}
      <div className="px-4 pt-2 pb-1">
        {/* Top Navigation Bar */}
        <div className="flex justify-end items-center mb-3">
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 rounded-lg border-2 border-white hover:bg-white/10 text-white transition-colors text-xl"
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
                    <h3 className="font-button font-bold mb-3">
                      Notifications
                    </h3>
                    {mockNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="mb-3 p-3 bg-white/5 rounded-lg"
                      >
                        <p className="text-sm">{notif.message}</p>
                        <p className="text-xs text-white/60 mt-1">
                          {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              to="settings"
              className="p-3 rounded-lg border-2 border-white hover:bg-white/10 text-white transition-colors text-xl"
            >
              ⚙️
            </Link>
          </div>
        </div>

        {/* Title */}
        <Heading />
      </div>

      {/* Main Panel Container */}
      <div className="px-4 flex-1 flex items-start">
        <div className="max-w-7xl mx-auto w-full">
          {/* Light Transparent Navy Panel */}
          <div className="bg-smart-dark-blue/30 border border-[#1a237e] backdrop-blur-sm rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] h-[calc(100vh-200px)]">
            {/* Panel Content - Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Leaderboard & Let's Play Button */}
              <div className="space-y-6">
                {/* Leaderboard */}
                <div className="bg-smart-orange rounded-2xl p-4 border-4 border-smart-yellow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-2xl font-bold text-smart-yellow text-center flex-1">
                      HIGHSCORE LEADERBOARD
                    </h2>
                  </div>

                  {/* Leaderboard container with slider */}
                  <div className="flex gap-4">
                    {/* Leaderboard entries */}
                    <div className="flex-1 h-80 overflow-hidden relative">
                      <div
                        className="space-y-2 transition-transform duration-300 ease-in-out"
                        style={{
                          transform: `translateY(-${leaderboardStart * 64}px)`, // 64px per item (height + margin)
                        }}
                      >
                        {mockLeaderboard.map((player) => (
                          <div
                            key={player.rank}
                            className="flex items-center gap-3 bg-smart-yellow/20 rounded-lg p-3 h-14 ml-4 mr-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-heading text-xl font-bold text-smart-black">
                                #{player.rank}
                              </span>
                              <div className="w-10 h-10 rounded-full bg-smart-white text-smart-black flex items-center justify-center font-bold text-base">
                                {player.avatar}
                              </div>
                              <span className="font-button font-bold text-smart-black text-base">
                                {player.name}
                              </span>
                            </div>
                            <div className="ml-auto font-button font-bold text-smart-black text-base">
                              {player.highScore.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Vertical Slider */}
                    <div className="flex flex-col items-center h-80 w-8">
                      <div
                        className="flex-1 w-2 bg-smart-yellow/30 rounded-full relative cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickY = e.clientY - rect.top;
                          const percentage = clickY / rect.height;
                          const newStart = Math.round(
                            percentage * Math.max(0, mockLeaderboard.length - 5)
                          );
                          setLeaderboardStart(
                            Math.min(
                              Math.max(0, newStart),
                              mockLeaderboard.length - 5
                            )
                          );
                        }}
                      >
                        {/* Slider thumb - draggable */}
                        <div
                          className="absolute w-4 h-6 bg-smart-yellow rounded-lg shadow-lg cursor-grab active:cursor-grabbing -left-1"
                          style={{
                            top: `${
                              (leaderboardStart /
                                Math.max(1, mockLeaderboard.length - 5)) *
                              (100 - 7.5)
                            }%`,
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const startY = e.clientY;
                            const startPos = leaderboardStart;
                            const slider = e.currentTarget.parentElement;
                            const sliderHeight =
                              slider.getBoundingClientRect().height;
                            const maxPos = Math.max(
                              0,
                              mockLeaderboard.length - 5
                            );

                            const handleMouseMove = (moveEvent) => {
                              const deltaY = moveEvent.clientY - startY;
                              const deltaPos = (deltaY / sliderHeight) * maxPos;
                              const newPos = Math.round(startPos + deltaPos);
                              setLeaderboardStart(
                                Math.min(Math.max(0, newPos), maxPos)
                              );
                            };

                            const handleMouseUp = () => {
                              document.removeEventListener(
                                "mousemove",
                                handleMouseMove
                              );
                              document.removeEventListener(
                                "mouseup",
                                handleMouseUp
                              );
                            };

                            document.addEventListener(
                              "mousemove",
                              handleMouseMove
                            );
                            document.addEventListener("mouseup", handleMouseUp);
                          }}
                        />
                      </div>
                    </div>
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
              <div>
                {/* ProfileCard */}
                <ProfileCard
                  user={{
                    username: user.username,
                    avatar: user.avatarUrl,
                    gamesPlayed: user.gamesPlayed,
                    highScore: user.highScore,
                    wins: user.wins,
                    memberSince: user.memberSince,
                  }}
                  size="large"
                  stickmanStrokeWidth={
                    parseInt(localStorage.getItem("stickmanStrokeWidth")) || 3
                  }
                  stickmanColor={
                    localStorage.getItem("stickmanColor") || "smart-light-blue"
                  }
                  stickmanHeight={
                    parseInt(localStorage.getItem("stickmanHeight")) || 120
                  }
                  stickmanWidth={
                    parseInt(localStorage.getItem("stickmanWidth")) || 80
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
