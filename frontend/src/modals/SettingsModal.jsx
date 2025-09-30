/**
 * SOMEONE DO THIS
 * MODAL: Settings (from Landing)
 * Sidebar with 4 tabs -> /landing/settings, /landing/settings/1..4
 * Close with ✕ in modal chrome
 */
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

  return (
    <div className="flex gap-4">
      {/* Sidebar - make it slimmer */}
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
        {active === "1" ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* Left: Form (smaller: 1/4) */}
            <form className="flex flex-col gap-4 md:col-span-1">
              <h3 className="text-base font-semibold text-slate-100">
                Update Profile
              </h3>

              <label className="flex flex-col text-xs text-slate-300">
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-md border border-slate-500 bg-slate-800 px-2 py-1 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring focus:ring-blue-500/30"
                />
              </label>

              <label className="flex flex-col text-xs text-slate-300">
                Password
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-500 bg-slate-800 px-2 py-1 pr-10 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring focus:ring-blue-500/30"
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

              <label className="flex flex-col text-xs text-slate-300">
                Avatar URL
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="rounded-md border border-slate-500 bg-slate-800 px-2 py-1 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring focus:ring-blue-500/30"
                />
              </label>

              <button
                type="submit"
                className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </form>

            {/* Right: ProfileCard (bigger: 3/4) */}
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
        ) : (
          <div>
            <h3 className="mb-2 text-lg font-semibold text-slate-100">
              Settings — {tabs.find((t) => t.id === active)?.label}
            </h3>
            <p className="text-sm text-slate-400">
              Placeholder for {tabs.find((t) => t.id === active)?.label}.
            </p>
          </div>
        )}
      </section>
    </div>

  );
}
