import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import ProfileCard from "../components/ProfileCard";

const tabs = [
  { id: "1", label: "Account" },
  { id: "2", label: "Stats" },
  { id: "3", label: "Match History" },
  { id: "4", label: "Other" },
];

export default function SettingsModal() {
  const { tabId } = useParams();
  const navigate = useNavigate();
  const active = tabId ?? "1";

  // Profile state (for Page 1)
  const [username, setUsername] = useState("Wikus");
  const [password, setPassword] = useState("Secret123!");
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState(
    "http://localhost:3000/uploads/conrad.jpg"
  );
  const [gamesPlayed] = useState(42);
  const [highScore] = useState(2450);
  const [wins] = useState(12);
  const [memberSince] = useState("2024-01-12T00:00:00Z");

  // Mock match history (for Page 3)
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

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <aside className="w-32 shrink-0">
        <nav className="flex flex-col gap-2">
          {tabs.map((t) => (
            <NavLink
              key={t.id}
              to={`/landing/settings/${t.id}`}
              className={({ isActive }) =>
                `rounded-lg border px-2 py-1.5 text-xs transition ${
                  isActive
                    ? "bg-slate-700 text-slate-100 font-semibold"
                    : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => navigate("/landing")}
          className="mt-3 w-full rounded-lg border border-slate-500 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-slate-100"
        >
          ✕ Close
        </button>
      </aside>

      {/* Content */}
      <section className="flex-1 rounded-xl border border-slate-600 bg-slate-800/50 p-6 min-h-[450px]">
        {active === "1" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* Left: Form */}
            <form className="flex flex-col gap-4 md:col-span-1">
              <h3 className="text-base font-semibold text-slate-100">
                Update Profile
              </h3>
              {/* Username */}
              <label className="flex flex-col text-xs text-slate-300">
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-md border border-slate-500 bg-slate-800 px-2 py-1 text-slate-100"
                />
              </label>
              {/* Password */}
              <label className="flex flex-col text-xs text-slate-300">
                Password
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-500 bg-slate-800 px-2 py-1 pr-10 text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
              {/* Avatar */}
              <label className="flex flex-col text-xs text-slate-300">
                Avatar URL
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="rounded-md border border-slate-500 bg-slate-800 px-2 py-1 text-slate-100"
                />
              </label>
              <button
                type="submit"
                className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </form>
            {/* Right: ProfileCard */}
            <div className="md:col-span-3 flex items-center">
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
          <div>
            <h3 className="mb-6 text-xl font-bold text-slate-100">Your Epic Stats 🚀</h3>

            <div className="space-y-4">
              {/* Core Stats */}
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Games Played</span>
                <span className="font-semibold">{gamesPlayed}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>High Score</span>
                <span className="font-semibold">{highScore}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Win Rate</span>
                <span className="font-semibold">{((wins / gamesPlayed) * 100).toFixed(1)}%</span>
              </div>

              {/* Fun Bars */}
              <div>
                <p className="mb-1 text-sm font-semibold text-slate-200">😎 Aura</p>
                <div className="h-3 w-full rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse"
                    style={{ width: `${Math.min(100, wins * 8)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-slate-200">🧠 Brain Power</p>
                <div className="h-3 w-full rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-green-400 animate-pulse"
                    style={{ width: `${Math.min(100, (highScore / 3000) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-slate-200">🔥 Dedication</p>
                <div className="h-3 w-full rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-600 animate-pulse"
                    style={{ width: `${Math.min(100, gamesPlayed * 2)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}


        {active === "3" && (
          <div>
            <h3 className="mb-6 text-xl font-bold text-slate-100">Match History 🎯</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {matchHistory.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-600 bg-slate-700/40 p-4 shadow-md hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{new Date(m.date).toLocaleDateString()}</span>
                    <span className="uppercase text-slate-300">{m.category}</span>
                  </div>

                  <p className="mt-2 text-lg font-bold text-slate-100">
                    Score: {m.score}
                  </p>
                  <p className="text-sm text-slate-300">Placement: #{m.placement}</p>

                  <div className="mt-3 h-2 w-full rounded-full bg-slate-600 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        m.placement === 1
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                          : "bg-gradient-to-r from-slate-400 to-slate-500"
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
          <div>
            <h3 className="mb-2 text-lg font-semibold text-slate-100">
              Other Settings
            </h3>
            <p className="text-sm text-slate-400">
              Placeholder for extra settings.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
