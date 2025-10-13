import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileCard from "../components/ProfileCard";

const tabs = [
  {
    id: "1",
    label: "Account",
    color: "smart-pink",
    bgColor: "bg-smart-pink/20",
    borderColor: "border-smart-pink",
  },
  {
    id: "2",
    label: "Avatar",
    color: "smart-orange",
    bgColor: "bg-smart-orange/20",
    borderColor: "border-smart-orange",
  },
  {
    id: "3",
    label: "Stats",
    color: "smart-light-blue",
    bgColor: "bg-smart-light-blue/20",
    borderColor: "border-smart-light-blue",
  },
  {
    id: "4",
    label: "History",
    color: "smart-purple",
    bgColor: "bg-smart-purple/20",
    borderColor: "border-smart-purple",
  },
];

export default function SettingsModal() {
  const { tabId } = useParams();
  const navigate = useNavigate();
  const active = tabId ?? "1";

  const API_URL = "/api/users";

  // Profile state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);

  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Stick man settings
  const [stickmanStrokeWidth, setStickmanStrokeWidth] = useState(() => {
    return parseInt(localStorage.getItem("stickmanStrokeWidth")) || 3;
  });
  const [stickmanHeight, setStickmanHeight] = useState(() => {
    return parseInt(localStorage.getItem("stickmanHeight")) || 120;
  });
  const [stickmanWidth, setStickmanWidth] = useState(() => {
    return parseInt(localStorage.getItem("stickmanWidth")) || 80;
  });
  const [stickmanColor, setStickmanColor] = useState(() => {
    return localStorage.getItem("stickmanColor") || "smart-light-blue";
  });

  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    highScore: 0,
    wins: 0,
    memberSince: null
  });

  // Match history state
  const [matchHistory, setMatchHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  //===============================================

  // Fetch current user on mount
  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUsername(data.user.username || "");
          setAvatar(data.user.avatarUrl || "");
          // Set current user stats
          setUserStats({
            gamesPlayed: data.user.gamesPlayed || 0,
            highScore: data.user.highScore || 0,
            wins: data.user.wins || 0,
            memberSince: data.user.memberSince || data.user.createdAt
          });
        } else {
          console.error("Fetch user error:", data.error);
        }
      } catch (err) {
        console.error("Fetch user failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Fetch user match history
  useEffect(() => {
    async function fetchHistory() {
      try {
        setHistoryLoading(true);
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setMatchHistory([]);
          setHistoryError("Not authenticated");
          return;
        }
        const res = await fetch(`/api/users/me/history?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.history)) {
          setMatchHistory(data.history);
        } else {
          setHistoryError(data.error || "Failed to load history");
        }
      } catch (err) {
        setHistoryError(err.message);
      } finally {
        setHistoryLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Logout functions
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setShowLogoutModal(false);
    navigate("/"); // Navigate to home page
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // Upload avatar
  async function handleAvatarUpload(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`/api/images/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.fileUrl) {
        setAvatar(data.fileUrl);
      } else {
        console.error("Upload error:", data.error || data);
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  }

  // Save profile
  async function handleSave(e) {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          password: password || undefined, // don’t send empty string
          avatarUrl: avatar,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Profile updated!");
        setUsername(data.user.username);
        setAvatar(data.user.avatarUrl);
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-smart-black/60 p-4">
        <p className="p-6 text-slate-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smart-black/60 p-4">
      <div
        className={`relative w-full max-w-4xl rounded-2xl border-2 bg-smart-dark-navy p-6 shadow-xl ${
          active === "1"
            ? "border-smart-pink"
            : active === "2"
            ? "border-smart-orange"
            : active === "3"
            ? "border-smart-light-blue"
            : active === "4"
            ? "border-smart-purple"
            : "border-smart-white"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => navigate("/landing")}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg flex items-center justify-center transition-colors duration-200 border-2 border-red-600 hover:border-red-700"
          title="Close Settings"
        >
          ×
        </button>

        <div
          className={`flex rounded-xl border-4 bg-smart-dark-navy overflow-hidden ${
            active === "1"
              ? "border-smart-pink"
              : active === "2"
              ? "border-smart-orange"
              : active === "3"
              ? "border-smart-light-blue"
              : active === "4"
              ? "border-smart-purple"
              : "border-smart-white"
          }`}
        >
          {/* Sidebar */}
          <aside
            className={`w-48 shrink-0 border-r-4 bg-smart-dark-navy p-4 ${
              active === "1"
                ? "border-smart-pink"
                : active === "2"
                ? "border-smart-orange"
                : active === "3"
                ? "border-smart-light-blue"
                : active === "4"
                ? "border-smart-purple"
                : "border-smart-white"
            }`}
          >
            <nav className="flex flex-col gap-3">
              {tabs.map((t) => (
                <NavLink
                  key={t.id}
                  to={`/landing/settings/${t.id}`}
                  className={({ isActive }) =>
                    `rounded-lg px-6 py-6 font-heading text-sm tracking-wide transition 
                border-2 text-center w-full block
                ${
                  isActive
                    ? `bg-${t.color} text-smart-white border-${t.color}`
                    : `text-${t.color} border-${t.color} hover:bg-${t.color}/20`
                }`
                  }
                >
                  {t.label.toUpperCase()}
                </NavLink>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="rounded-lg border-2 border-smart-red bg-smart-red/20 hover:bg-smart-red/30 px-6 py-4 font-heading text-sm tracking-wide text-smart-red transition-colors w-full text-center"
              >
                LOG OUT
              </button>
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1 p-6 min-h-[450px] bg-smart-dark-navy">
            {active === "1" && (
              <div>
                <h3 className="text-2xl font-heading text-smart-pink mb-4">
                  ⚙️ UPDATE PROFILE
                </h3>
                <div className="h-px bg-smart-pink/30 mb-6"></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Form */}
                  <form className="flex flex-col gap-4" onSubmit={handleSave}>
                    {/* Username */}
                    <label className="flex flex-col text-lg font-body text-smart-pink">
                      Username
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-2 rounded-lg border border-smart-pink bg-[#2d2d3a] px-4 py-3 text-smart-white focus:outline-none focus:ring-2 focus:ring-smart-pink text-lg"
                      />
                    </label>

                    {/* Password */}
                    <label className="flex flex-col text-lg font-body text-smart-pink">
                      Password
                      <div className="relative mt-2">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-lg border border-smart-pink bg-[#2d2d3a] px-4 py-3 pr-12 text-smart-white focus:outline-none focus:ring-2 focus:ring-smart-pink text-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-body text-smart-light-pink hover:text-smart-pink"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </label>

                    <button
                      type="submit"
                      className="mt-4 rounded-xl bg-smart-pink px-4 py-3 font-button text-black hover:bg-smart-light-pink transition"
                    >
                      Save Profile
                    </button>
                  </form>

                  {/* Right: ProfileCard */}
                  <div className="flex items-center justify-center">
                    <ProfileCard
                      user={{
                        username,
                        avatar,
                        gamesPlayed: userStats.gamesPlayed,
                        highScore: userStats.highScore,
                        wins: userStats.wins,
                        memberSince: userStats.memberSince,
                      }}
                      stickmanStrokeWidth={stickmanStrokeWidth}
                      stickmanColor={stickmanColor}
                      stickmanHeight={stickmanHeight}
                      stickmanWidth={stickmanWidth}
                    />
                  </div>
                </div>
              </div>
            )}

            {active === "2" && (
              <div>
                <h3 className="text-2xl font-heading text-smart-orange mb-4">
                  🎨 AVATAR CUSTOMIZATION
                </h3>
                <div className="h-px bg-smart-orange/30 mb-6"></div>

                <div className="flex gap-8">
                  {/* Left: Controls */}
                  <div className="flex-1 space-y-6">
                    {/* Stroke Width */}
                    <div>
                      <h4 className="mb-3 text-xl font-body text-smart-orange">
                        Line Width
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-body text-smart-orange/60">
                          Thin
                        </span>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={stickmanStrokeWidth}
                          onChange={(e) => {
                            const newWidth = parseInt(e.target.value);
                            setStickmanStrokeWidth(newWidth);
                            localStorage.setItem(
                              "stickmanStrokeWidth",
                              newWidth.toString()
                            );
                          }}
                          className="flex-1 h-2 bg-smart-black rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-lg font-body text-smart-orange/60">
                          Thick
                        </span>
                        <span className="text-lg font-body text-smart-orange font-bold min-w-[2rem]">
                          {stickmanStrokeWidth}
                        </span>
                      </div>
                    </div>

                    {/* Height */}
                    <div>
                      <h4 className="mb-3 text-xl font-body text-smart-orange">
                        Height
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-body text-smart-orange/60">
                          Short
                        </span>
                        <input
                          type="range"
                          min="80"
                          max="160"
                          value={stickmanHeight}
                          onChange={(e) => {
                            const newHeight = parseInt(e.target.value);
                            setStickmanHeight(newHeight);
                            localStorage.setItem(
                              "stickmanHeight",
                              newHeight.toString()
                            );
                          }}
                          className="flex-1 h-2 bg-smart-black rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-lg font-body text-smart-orange/60">
                          Tall
                        </span>
                        <span className="text-lg font-body text-smart-orange font-bold min-w-[2rem]">
                          {stickmanHeight}
                        </span>
                      </div>
                    </div>

                    {/* Width */}
                    <div>
                      <h4 className="mb-3 text-xl font-body text-smart-orange">
                        Width
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-body text-smart-orange/60">
                          Narrow
                        </span>
                        <input
                          type="range"
                          min="60"
                          max="120"
                          value={stickmanWidth}
                          onChange={(e) => {
                            const newWidth = parseInt(e.target.value);
                            setStickmanWidth(newWidth);
                            localStorage.setItem(
                              "stickmanWidth",
                              newWidth.toString()
                            );
                          }}
                          className="flex-1 h-2 bg-smart-black rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-lg font-body text-smart-orange/60">
                          Wide
                        </span>
                        <span className="text-lg font-body text-smart-orange font-bold min-w-[2rem]">
                          {stickmanWidth}
                        </span>
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <h4 className="mb-3 text-xl font-body text-smart-orange">
                        Color
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          {
                            name: "smart-light-blue",
                            label: "Blue",
                            bgClass: "bg-smart-light-blue",
                            textClass: "text-smart-light-blue",
                            borderClass: "border-smart-light-blue",
                            hoverClass: "hover:bg-smart-light-blue/20",
                          },
                          {
                            name: "smart-green",
                            label: "Green",
                            bgClass: "bg-smart-green",
                            textClass: "text-smart-green",
                            borderClass: "border-smart-green",
                            hoverClass: "hover:bg-smart-green/20",
                          },
                          {
                            name: "smart-yellow",
                            label: "Yellow",
                            bgClass: "bg-smart-yellow",
                            textClass: "text-smart-yellow",
                            borderClass: "border-smart-yellow",
                            hoverClass: "hover:bg-smart-yellow/20",
                          },
                          {
                            name: "smart-orange",
                            label: "Orange",
                            bgClass: "bg-smart-orange",
                            textClass: "text-smart-orange",
                            borderClass: "border-smart-orange",
                            hoverClass: "hover:bg-smart-orange/20",
                          },
                          {
                            name: "smart-red",
                            label: "Red",
                            bgClass: "bg-smart-red",
                            textClass: "text-smart-red",
                            borderClass: "border-smart-red",
                            hoverClass: "hover:bg-smart-red/20",
                          },
                          {
                            name: "smart-purple",
                            label: "Purple",
                            bgClass: "bg-smart-purple",
                            textClass: "text-smart-purple",
                            borderClass: "border-smart-purple",
                            hoverClass: "hover:bg-smart-purple/20",
                          },
                          {
                            name: "smart-light-pink",
                            label: "Pink",
                            bgClass: "bg-smart-light-pink",
                            textClass: "text-smart-light-pink",
                            borderClass: "border-smart-light-pink",
                            hoverClass: "hover:bg-smart-light-pink/20",
                          },
                          {
                            name: "smart-white",
                            label: "White",
                            bgClass: "bg-smart-white",
                            textClass: "text-smart-white",
                            borderClass: "border-smart-white",
                            hoverClass: "hover:bg-smart-white/20",
                          },
                        ].map((color) => (
                          <button
                            key={color.name}
                            onClick={() => {
                              setStickmanColor(color.name);
                              localStorage.setItem("stickmanColor", color.name);
                            }}
                            className={`rounded-lg p-3 text-lg font-body transition border-2 ${
                              stickmanColor === color.name
                                ? `${color.bgClass} text-smart-black ${color.borderClass}`
                                : `${color.textClass} ${color.borderClass} ${color.hoverClass}`
                            }`}
                          >
                            {color.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Stickman Preview */}
                  <div className="flex flex-col items-center justify-start pt-8">
                    <div className="flex flex-col items-center">
                      {/* Preview Label */}
                      <div className="text-smart-white text-lg font-heading mb-2">
                        PREVIEW
                      </div>

                      <svg
                        width="140"
                        height="180"
                        viewBox="0 0 140 180"
                        className={`text-${stickmanColor} opacity-80 mb-4`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={stickmanStrokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: `scale(${stickmanWidth / 140}, ${
                            stickmanHeight / 180
                          })`,
                        }}
                      >
                        <circle cx="70" cy="22" r="18" />
                        <line x1="70" y1="40" x2="70" y2="115" />
                        <line x1="70" y1="70" x2="35" y2="52" />
                        <line x1="70" y1="70" x2="105" y2="52" />
                        <line x1="70" y1="115" x2="43" y2="160" />
                        <line x1="70" y1="115" x2="97" y2="160" />
                      </svg>

                      {/* Arrow pointing up */}
                      <div className={`text-${stickmanColor} text-3xl mb-2`}>
                        ↑
                      </div>

                      {/* Username */}
                      <div
                        className={`text-${stickmanColor} text-2xl font-heading`}
                      >
                        {(username || "Player").toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === "3" && (
              <div>
                <h3 className="mb-4 text-2xl font-heading text-smart-light-blue">
                  🚀 YOUR EPIC STATS
                </h3>
                <div className="h-px bg-smart-light-blue/30 mb-6"></div>

                <div className="space-y-4">
                  {/* Core Stats */}
                  <div className="flex items-center justify-between text-lg font-body text-smart-light-blue">
                    <span>Games Played</span>
                    <span className="font-bold text-smart-light-blue">
                      {userStats.gamesPlayed || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-body text-smart-light-blue">
                    <span>High Score</span>
                    <span className="font-bold text-smart-light-blue">
                      {userStats.highScore || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-body text-smart-light-blue">
                    <span>Win Rate</span>
                    <span className="font-bold text-smart-light-blue">
                      {userStats.gamesPlayed > 0
                        ? ((userStats.wins / userStats.gamesPlayed) * 100).toFixed(1)
                        : "0"}%
                    </span>
                  </div>

                  {/* Fun Bars */}
                  <div>
                    <p className="mb-1 text-lg font-body font-semibold text-smart-light-blue">
                      😎 Aura
                    </p>
                    <div className="h-3 w-full rounded-full bg-smart-black overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-smart-light-blue"
                        style={{ width: `${Math.min(100, (userStats.wins || 0) * 8)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-lg font-body font-semibold text-smart-light-blue">
                      🧠 Brain Power
                    </p>
                    <div className="h-3 w-full rounded-full bg-smart-black overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-smart-light-blue"
                        style={{
                          width: `${Math.min(100, ((userStats.highScore || 0) / 3000) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-lg font-body font-semibold text-smart-light-blue">
                      🔥 Dedication
                    </p>
                    <div className="h-3 w-full rounded-full bg-smart-black overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-smart-light-blue"
                        style={{ width: `${Math.min(100, (userStats.gamesPlayed || 0) * 2)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === "4" && (
              <div>
                <h3 className="mb-4 text-2xl font-heading text-smart-purple">
                  🎯 MATCH HISTORY
                </h3>
                <div className="h-px bg-smart-purple/30 mb-6"></div>
                {historyLoading ? (
                  <p className="text-smart-purple">Loading history…</p>
                ) : historyError ? (
                  <p className="text-smart-purple">Error: {historyError}</p>
                ) : matchHistory.length === 0 ? (
                  <p className="text-smart-purple">No matches yet—go play a game!</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {matchHistory.map((m) => {
                      const maxScore = Math.max(1, userStats.highScore || 0);
                      const pct = Math.min(100, Math.round((m.score / maxScore) * 100));
                      return (
                        <div
                          key={`${m.id}-${m.date}`}
                          className="rounded-xl border-2 border-smart-purple bg-smart-black/30 p-4 hover:border-smart-light-blue transition"
                        >
                          <div className="flex items-center justify-between text-lg font-body text-smart-purple">
                            <span>{new Date(m.date).toLocaleDateString()}</span>
                            <span className="uppercase text-smart-purple">{m.category}</span>
                          </div>
                          <p className="mt-2 text-xl font-body font-bold text-smart-purple">
                            Score: {m.score}
                          </p>
                          <p className="text-lg font-body text-smart-purple">
                            Placement: #{m.placement}
                          </p>
                          <div className="mt-3 h-2 w-full rounded-full bg-smart-black overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                m.placement === 1 ? "bg-smart-yellow" : "bg-smart-purple"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-md mx-4 rounded-2xl bg-smart-dark-blue border-2 border-smart-red p-6 shadow-xl">
            <h3 className="mb-4 text-2xl font-heading text-smart-red text-center">
              LOGOUT
            </h3>
            <p className="mb-6 text-center text-smart-white font-body">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleLogoutCancel}
                className="rounded-xl border-2 border-smart-white/30 bg-smart-white/10 hover:bg-smart-white/20 px-6 py-2 font-button text-smart-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="rounded-xl border-2 border-smart-red bg-smart-red hover:bg-smart-red/80 px-6 py-2 font-button text-smart-white transition-colors"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
