/**
 * NINA
 * PAGE: Create Game (spec #5)
 * Heading + "Send Invite" -> /lobby (spec #6 Game Lobby)
 * Back: to Game Menu "/game"
 */
import { Link, useNavigate } from "react-router-dom";

export default function CreateGame() {
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
        <h1 className="text-3xl font-bold">Create Game</h1>
        <Link
          to="/lobby"
          className="rounded-xl border px-6 py-3 hover:bg-slate-100"
        >
          Send Invite
        </Link>
      </div>
    </div>
  );
}
