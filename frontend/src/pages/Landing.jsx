/**
 * NINA
 * PAGE: Landing (after login)
 * Heading: "SMARTIE PANTS LANDING PAGE"
 * Buttons:
 *  - Let's Play -> /game
 *  - Settings (top-right) opens /landing/settings modal
 * Back: back to Home "/"
 */
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 rounded-lg border px-4 py-2 hover:bg-slate-100"
      >
        ← Back
      </button>

      <Link
        to="settings"
        className="absolute right-4 top-4 rounded-lg border px-4 py-2 hover:bg-slate-100"
      >
        Settings
      </Link>

      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">SMARTIE PANTS LANDING PAGE</h1>
        <Link
          to="/game"
          className="rounded-xl border px-6 py-3 hover:bg-slate-100"
        >
          Let&apos;s Play
        </Link>
      </div>

      <Outlet />
    </div>
  );
}
