/**
 * AMY
 * PAGE: Game Lobby (spec #6)
 * Buttons:
 *  - Play Game -> /game/play
 *  - Show Round Number -> /lobby/round (modal)
 * Back: to previous (Create/Join)
 */
import { Link, useNavigate, Outlet } from "react-router-dom";


export default function Lobby() {
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
        <h1 className="text-3xl font-bold">Game Lobby</h1>
        <div className="flex gap-3 justify-center">
          <Link
            to="/game/play"
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Play Game
          </Link>
          <Link
            to="/lobby/round"
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Show Round Number
          </Link>
        </div>
      </div>

      {/* round modal outlet */}
      <Outlet />
    </div>
  );
}
