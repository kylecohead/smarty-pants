/**
 * NINA
 * PAGE: Join Game (spec #6)
 * "To Lobby" -> /lobby
 * Back: to Game Menu "/game"
 */
import { Link, useNavigate } from "react-router-dom";

export default function JoinGame() {
  const navigate = useNavigate();
  return (
    <div className="center-screen">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 rounded-lg border px-4 py-2 hover:bg-slate-100"
      >
        ← Back
      </button>

      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Join Game</h1>
        <Link
          to="/lobby"
          className="rounded-xl border px-6 py-3 hover:bg-slate-100"
        >
          To Lobby
        </Link>
      </div>
    </div>
  );
}
