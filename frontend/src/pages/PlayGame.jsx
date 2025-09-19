/**
 * KYLE
 * PAGE: Game Page (spec #7)
 * Buttons:
 *  - Pause (opens /game/play/pause modal)
 *  - Back to Home (Landing) -> /landing
 * Back: to Lobby "/lobby"
 */
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function PlayGame() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 rounded-lg border px-4 py-2 hover:bg-slate-100"
      >
        ← Back
      </button>

      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Game Page</h1>

        <div className="flex gap-3 justify-center">
          <Link
            to="pause"
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Pause
          </Link>
          <Link
            to="/landing"
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* pause modal outlet */}
      <Outlet />
    </div>
  );
}
