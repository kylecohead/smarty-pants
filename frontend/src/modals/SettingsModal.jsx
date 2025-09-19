/**
 * SOMEONE DO THIS
 * MODAL: Settings (from Landing)
 * Sidebar with 4 tabs -> /landing/settings, /landing/settings/1..4
 * Close with ✕ in modal chrome
 */
import { NavLink, useParams, useNavigate } from "react-router-dom";

const tabs = [
  { id: "1", label: "Settings Page 1" },
  { id: "2", label: "Settings Page 2" },
  { id: "3", label: "Settings Page 3" },
  { id: "4", label: "Settings Page 4" },
];

export default function SettingsModal() {
  const { tabId } = useParams();
  const navigate = useNavigate();
  const active = tabId ?? "1";

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <aside className="w-40 shrink-0">
        <nav className="flex flex-col gap-2">
          {tabs.map((t) => (
            <NavLink
              key={t.id}
              to={`/landing/settings/${t.id}`}
              className={({ isActive }) =>
                `rounded-lg border px-3 py-2 text-sm hover:bg-slate-100 ${
                  isActive ? "bg-slate-100" : ""
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 w-full rounded-lg border px-3 py-2 text-sm hover:bg-slate-100"
        >
          Close
        </button>
      </aside>

      {/* Content */}
      <section className="flex-1 rounded-xl border p-4">
        <h3 className="mb-2 text-lg font-semibold">Settings — Page {active}</h3>
        <p className="text-sm text-slate-600">
          This is placeholder content for Settings Page {active}. Add your real
          settings here.
        </p>
      </section>
    </div>
  );
}
