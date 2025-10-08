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

  //MOCK DATA======================================
  // Dummy stats for now
  const [gamesPlayed] = useState(42);
  const [highScore] = useState(2450);
  const [wins] = useState(12);
  const [memberSince] = useState("2024-01-12T00:00:00Z");

  // Match history (mock)
  const [matchHistory] = useState([
    {
      id: 1,
      date: "2025-09-18T19:30:00Z",
      category: "Science",
      score: 1800,
      placement: 2,
    },
    {
      id: 2,
      date: "2025-09-20T20:00:00Z",
      category: "Geography",
      score: 2450,
      placement: 1,
    },
  ]);
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
      <div className="relative w-full max-w-4xl rounded-2xl border-2 border-smart-white bg-smart-dark-navy p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg flex items-center justify-center transition-colors duration-200 border-2 border-red-600 hover:border-red-700"
          title="Close Settings"
        >
          ×
        </button>

        <div className="flex rounded-xl border-4 border-smart-white bg-smart-dark-navy overflow-hidden">
          {/* Sidebar */}
          <aside className="w-48 shrink-0 border-r-4 border-smart-white bg-smart-dark-navy p-4">
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
                    <label className="flex flex-col text-sm font-body text-smart-pink">
                      Username
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-2 rounded-lg border border-smart-pink bg-[#2d2d3a] px-4 py-3 text-smart-white focus:outline-none focus:ring-2 focus:ring-smart-pink"
                      />
                    </label>

                    {/* Password */}
                    <label className="flex flex-col text-sm font-body text-smart-pink">
                      Password
                      <div className="relative mt-2">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-lg border border-smart-pink bg-[#2d2d3a] px-4 py-3 pr-12 text-smart-white focus:outline-none focus:ring-2 focus:ring-smart-pink"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-body text-smart-light-pink hover:text-smart-pink"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </label>

                    {/* Edit Avatar */}
                    <div className="flex flex-col text-sm font-body text-smart-pink">
                      <span>Avatar Customization</span>
                      <button
                        type="button"
                        onClick={() => navigate("/landing/settings/2")}
                        className="mt-2 rounded-lg border-2 border-smart-orange bg-smart-orange px-4 py-3 text-sm font-button text-black hover:bg-smart-orange/80 transition"
                      >
                        🎨 Edit Avatar
                      </button>
                    </div>

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
                        gamesPlayed,
                        highScore,
                        wins,
                        memberSince,
                      }}
                      stickmanStrokeWidth={stickmanStrokeWidth}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Controls */}
                  <div className="space-y-6">
                    {/* Stroke Width */}
                    <div>
                      <h4 className="mb-3 text-md font-body text-smart-orange">
                        Line Width
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-body text-smart-orange/60">
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
                        <span className="text-sm font-body text-smart-orange/60">
                          Thick
                        </span>
                        <span className="text-sm font-body text-smart-orange font-bold min-w-[2rem]">
                          {stickmanStrokeWidth}
                        </span>
                      </div>
                    </div>

                    {/* Height */}
                    <div>
                      <h4 className="mb-3 text-md font-body text-smart-orange">
                        Height
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-body text-smart-orange/60">
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
                        <span className="text-sm font-body text-smart-orange/60">
                          Tall
                        </span>
                        <span className="text-sm font-body text-smart-orange font-bold min-w-[2rem]">
                          {stickmanHeight}
                        </span>
                      </div>
                    </div>

                    {/* Width */}
                    <div>
                      <h4 className="mb-3 text-md font-body text-smart-orange">
                        Width
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-body text-smart-orange/60">
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
                        <span className="text-sm font-body text-smart-orange/60">
                          Wide
                        </span>
                        <span className="text-sm font-body text-smart-orange font-bold min-w-[2rem]">
                          {stickmanWidth}
                        </span>
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <h4 className="mb-3 text-md font-body text-smart-orange">
                        Color
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { name: "smart-light-blue", label: "Blue" },
                          { name: "smart-green", label: "Green" },
                          { name: "smart-yellow", label: "Yellow" },
                          { name: "smart-orange", label: "Orange" },
                          { name: "smart-red", label: "Red" },
                          { name: "smart-purple", label: "Purple" },
                          { name: "smart-light-pink", label: "Pink" },
                          { name: "smart-white", label: "White" },
                        ].map((color) => (
                          <button
                            key={color.name}
                            onClick={() => {
                              setStickmanColor(color.name);
                              localStorage.setItem("stickmanColor", color.name);
                            }}
                            className={`rounded-lg p-3 text-xs font-body transition border-2 ${
                              stickmanColor === color.name
                                ? `bg-${color.name} text-smart-black border-${color.name}`
                                : `text-${color.name} border-${color.name} hover:bg-${color.name}/20`
                            }`}
                          >
                            {color.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Preview */}
                  <div className="flex items-center justify-center">
                    <div className="p-6 rounded-lg border-2 border-smart-orange bg-smart-dark-navy">
                      <h5 className="text-center text-sm font-body text-smart-orange mb-4">
                        Preview
                      </h5>
                      <svg
                        width={stickmanWidth}
                        height={stickmanHeight}
                        viewBox={`0 0 ${stickmanWidth} ${stickmanHeight}`}
                        className={`text-${stickmanColor} opacity-80`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={stickmanStrokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle
                          cx={stickmanWidth / 2}
                          cy={stickmanHeight * 0.125}
                          r={stickmanHeight * 0.1}
                        />
                        <line
                          x1={stickmanWidth / 2}
                          y1={stickmanHeight * 0.225}
                          x2={stickmanWidth / 2}
                          y2={stickmanHeight * 0.625}
                        />
                        <line
                          x1={stickmanWidth / 2}
                          y1={stickmanHeight * 0.375}
                          x2={stickmanWidth * 0.25}
                          y2={stickmanHeight * 0.29}
                        />
                        <line
                          x1={stickmanWidth / 2}
                          y1={stickmanHeight * 0.375}
                          x2={stickmanWidth * 0.75}
                          y2={stickmanHeight * 0.29}
                        />
                        <line
                          x1={stickmanWidth / 2}
                          y1={stickmanHeight * 0.625}
                          x2={stickmanWidth * 0.31}
                          y2={stickmanHeight * 0.875}
                        />
                        <line
                          x1={stickmanWidth / 2}
                          y1={stickmanHeight * 0.625}
                          x2={stickmanWidth * 0.69}
                          y2={stickmanHeight * 0.875}
                        />
                      </svg>
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
                  <div className="flex items-center justify-between text-sm font-body text-smart-light-blue">
                    <span>Games Played</span>
                    <span className="font-bold text-smart-light-blue">
                      {gamesPlayed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-body text-smart-light-blue">
                    <span>High Score</span>
                    <span className="font-bold text-smart-light-blue">
                      {highScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-body text-smart-light-blue">
                    <span>Win Rate</span>
                    <span className="font-bold text-smart-light-blue">
                      {((wins / gamesPlayed) * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Fun Bars */}
                  <div>
                    <p className="mb-1 text-sm font-body font-semibold text-smart-light-blue">
                      😎 Aura
                    </p>
                    <div className="h-3 w-full rounded-full bg-smart-black overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-smart-light-blue"
                        style={{ width: `${Math.min(100, wins * 8)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-body font-semibold text-smart-light-blue">
                      🧠 Brain Power
                    </p>
                    <div className="h-3 w-full rounded-full bg-smart-black overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-smart-light-blue"
                        style={{
                          width: `${Math.min(100, (highScore / 3000) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-body font-semibold text-smart-light-blue">
                      🔥 Dedication
                    </p>
                    <div className="h-3 w-full rounded-full bg-smart-black overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-smart-light-blue"
                        style={{ width: `${Math.min(100, gamesPlayed * 2)}%` }}
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
                <div className="grid gap-4 md:grid-cols-2">
                  {matchHistory.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-xl border-2 border-smart-purple bg-smart-black/30 p-4 hover:border-smart-light-blue transition"
                    >
                      <div className="flex items-center justify-between text-xs font-body text-smart-purple">
                        <span>{new Date(m.date).toLocaleDateString()}</span>
                        <span className="uppercase text-smart-purple">
                          {m.category}
                        </span>
                      </div>

                      <p className="mt-2 text-lg font-body font-bold text-smart-purple">
                        Score: {m.score}
                      </p>
                      <p className="text-sm font-body text-smart-purple">
                        Placement: #{m.placement}
                      </p>

                      <div className="mt-3 h-2 w-full rounded-full bg-smart-black overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            m.placement === 1
                              ? "bg-smart-yellow"
                              : "bg-smart-purple"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (m.score / highScore) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
