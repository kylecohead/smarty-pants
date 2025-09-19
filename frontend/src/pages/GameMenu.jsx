/**
 * PAGE: Game Menu (spec #4 "The game page")
 * Buttons:
 *  - Create Game -> /game/create
 *  - Join Game -> /game/join
 * Back: to Landing "/landing"
 */
import { Link, useNavigate } from "react-router-dom";

export default function GameMenu() {
  const navigate = useNavigate();
  return (
    <div className="center-screen">
      <div className="text-center space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg border px-4 py-2 hover:bg-slate-100"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">Game Menu</h1>
        <div className="flex flex-col items-center gap-3">
          <Link
            to="/game/create"
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Create Game
          </Link>
          <Link
            to="/game/join"
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Join Game
          </Link>
        </div>
      </div>
    </div>
  );
}
