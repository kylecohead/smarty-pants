import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileCard from "../components/ProfileCard";

const tabs = [
  { id: "1", label: "Account" },
  { id: "2", label: "Stats" },
  { id: "3", label: "History" },
  { id: "4", label: "Other" },
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



  //MOCK DATA======================================
  // Dummy stats for now
  const [gamesPlayed] = useState(42);
  const [highScore] = useState(2450);
  const [wins] = useState(12);
  const [memberSince] = useState("2024-01-12T00:00:00Z");

  // Match history (mock)
  const [matchHistory] = useState([
    { id: 1, date: "2025-09-18T19:30:00Z", category: "Science", score: 1800, placement: 2 },
    { id: 2, date: "2025-09-20T20:00:00Z", category: "Geography", score: 2450, placement: 1 },
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
    return <p className="p-6 text-slate-400">Loading profile...</p>;
  }

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <aside className="w-24 shrink-0 rounded-xl border border-smart-light-blue bg-smart-black/60 backdrop-blur-md shadow-lg shadow-smart-light-blue/30 p-3">
        <nav className="flex flex-col gap-3">
          {tabs.map((t) => (
            <NavLink
              key={t.id}
              to={`/landing/settings/${t.id}`}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition 
                border-2 
                ${
                  isActive
                    ? "bg-gradient-to-r from-smart-purple via-smart-pink to-smart-orange text-smart-white border-smart-pink shadow-lg shadow-smart-pink/40"
                    : "text-smart-light-blue border-transparent hover:border-smart-purple hover:text-smart-yellow hover:bg-smart-dark-blue/40"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => navigate("/landing")}
          className="mt-4 w-full rounded-lg border-2 border-smart-red px-3 py-2 text-xs font-semibold text-smart-red transition hover:bg-smart-red hover:text-smart-white hover:shadow-lg hover:shadow-smart-red/40"
        >
          ✕ Close
        </button>
      </aside>


      {/* Content */}
      <section className="flex-1 rounded-xl border border-smart-light-blue 
        bg-smart-black/40 backdrop-blur-md shadow-lg shadow-smart-light-blue/30 
        p-6 min-h-[450px]">


        {active === "1" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* Left: Form */}
            <form
              className="flex flex-col gap-4 md:col-span-1 p-4 rounded-xl border-2 border-smart-purple bg-smart-black/60 backdrop-blur-md shadow-lg shadow-smart-purple/30"
              onSubmit={handleSave}
            >
              <h3 className="text-base font-semibold text-smart-light-blue">⚙️ Update Profile</h3>

              {/* Username */}
              <label className="flex flex-col text-xs text-smart-light-blue">
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-md border border-smart-light-blue bg-smart-black/60 px-2 py-1 text-smart-white focus:ring-2 focus:ring-smart-purple"
                />
              </label>

              {/* Password */}
              <label className="flex flex-col text-xs text-smart-light-blue">
                Password
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-smart-light-blue bg-smart-black/60 px-2 py-1 pr-10 text-smart-white focus:ring-2 focus:ring-smart-pink"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-smart-light-pink hover:text-smart-pink"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {/* Avatar Upload */}
              <label className="flex flex-col text-xs text-smart-light-blue">
                Upload Avatar
                <div className="mt-2 flex items-center gap-4">
                  {/* Hidden input */}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Show preview instantly
                        const previewUrl = URL.createObjectURL(file);
                        setAvatar(previewUrl); // show preview
                        handleAvatarUpload(file); // still upload to backend
                      }
                    }}
                  />

                  {/* Custom neon button */}
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer rounded-lg border-2 border-smart-light-blue 
                              bg-gradient-to-r from-smart-purple via-smart-pink to-smart-orange 
                              px-3 py-2 text-xs font-bold text-smart-white shadow-md 
                              hover:shadow-lg hover:shadow-smart-pink/40 transition"
                  >
                    📷 
                  </label>

        
                </div>
              </label>


              <button
                type="submit"
                className="mt-2 rounded-lg bg-gradient-to-r from-smart-purple via-smart-pink to-smart-orange px-3 py-2 text-sm font-bold text-smart-white shadow-md hover:shadow-lg hover:shadow-smart-pink/40"
              >
                Save
              </button>
            </form>

            {/* Right: ProfileCard */}
            <div className="md:col-span-3 flex items-center justify-center">
              <ProfileCard
                user={{
                  username,
                  avatar,
                  gamesPlayed,
                  highScore,
                  wins,
                  memberSince,
                }}
              />
            </div>
          </div>
        )}

        {active === "2" && (
          <div className="p-6 rounded-xl border-2 border-smart-light-blue bg-smart-black/60 shadow-lg shadow-smart-light-blue/30">
            <h3 className="mb-6 text-xl font-bold text-smart-yellow">🚀 Your Epic Stats</h3>

            <div className="space-y-4">
              {/* Core Stats */}
              <div className="flex items-center justify-between text-sm text-smart-white">
                <span>Games Played</span>
                <span className="font-bold text-smart-green">{gamesPlayed}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-smart-white">
                <span>High Score</span>
                <span className="font-bold text-smart-pink">{highScore}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-smart-white">
                <span>Win Rate</span>
                <span className="font-bold text-smart-light-blue">
                  {((wins / gamesPlayed) * 100).toFixed(1)}%
                </span>
              </div>

              {/* Fun Bars */}
              <div>
                <p className="mb-1 text-sm font-semibold text-smart-light-pink">😎 Aura</p>
                <div className="h-3 w-full rounded-full bg-smart-black/40 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-smart-pink via-smart-purple to-smart-orange animate-pulse"
                    style={{ width: `${Math.min(100, wins * 8)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-smart-green">🧠 Brain Power</p>
                <div className="h-3 w-full rounded-full bg-smart-black/40 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-smart-light-blue via-smart-dark-blue to-smart-green animate-pulse"
                    style={{ width: `${Math.min(100, (highScore / 3000) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-smart-orange">🔥 Dedication</p>
                <div className="h-3 w-full rounded-full bg-smart-black/40 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-smart-orange to-smart-red animate-pulse"
                    style={{ width: `${Math.min(100, gamesPlayed * 2)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === "3" && (
          <div>
            <h3 className="mb-6 text-xl font-bold text-smart-purple">🎯 Match History</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {matchHistory.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border-2 border-smart-light-blue bg-smart-black/50 p-4 shadow-lg hover:shadow-smart-light-blue/40 transition"
                >
                  <div className="flex items-center justify-between text-xs text-smart-light-blue">
                    <span>{new Date(m.date).toLocaleDateString()}</span>
                    <span className="uppercase text-smart-yellow">{m.category}</span>
                  </div>

                  <p className="mt-2 text-lg font-bold text-smart-white">Score: {m.score}</p>
                  <p className="text-sm text-smart-light-pink">Placement: #{m.placement}</p>

                  <div className="mt-3 h-2 w-full rounded-full bg-smart-black/30 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        m.placement === 1
                          ? "bg-gradient-to-r from-smart-yellow to-smart-green"
                          : "bg-gradient-to-r from-smart-purple to-smart-pink"
                      }`}
                      style={{ width: `${Math.min(100, (m.score / highScore) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "4" && (
          <div className="p-6 rounded-xl border-2 border-smart-orange bg-smart-black/60 shadow-lg shadow-smart-orange/30">
            <h3 className="mb-2 text-lg font-bold text-smart-orange">⚡ Other Settings</h3>
            <p className="text-sm text-smart-white/70">
              Placeholder for extra settings. Add more neon toggles here!
            </p>
          </div>
        )}

      </section>
    </div>
  );
}
