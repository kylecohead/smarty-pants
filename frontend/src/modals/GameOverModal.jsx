/**
 * GameOverModal - Final game results screen.
 * Displays the winner, final leaderboard, and option to return home.
 */
import { useLocation, useNavigate } from "react-router-dom";

export default function GameOverModal() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const leaderboard = Array.isArray(state?.leaderboard)
    ? state.leaderboard
    : [];
  const yourScore = state?.yourScore;
  const winner = leaderboard[0];

  return (
    <div className="w-full text-white">
      {/* Header */}
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">
          Trivia Showdown
        </p>
        <h2 className="mt-2 font-heading text-4xl font-black text-smart-light-blue drop-shadow">
          Smartie Pants Champion
        </h2>
        <p className="mt-3 text-lg uppercase tracking-[0.3em] text-white/70">
          {winner?.isYou ? "You" : winner?.name} takes the crown
        </p>
      </header>

      {/* Winner Display */}
      <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-extrabold text-white shadow-lg">
        {winner?.isYou ? "You" : winner?.name}
      </div>

      {/* Your Score */}
      {typeof yourScore === "number" && (
        <p className="mt-6 text-center text-lg text-white/80">
          Your Score:{" "}
          <span className="font-heading text-3xl text-smart-green">
            {yourScore}
          </span>
        </p>
      )}

      {/* Final Leaderboard */}
      <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full border-collapse text-left text-sm sm:text-base">
          <thead className="bg-white/10 uppercase tracking-[0.25em] text-white/60">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, i) => (
              <tr
                key={row.id ?? i}
                className={`border-t border-white/10 ${
                  row.isYou ? "bg-white/15" : "bg-transparent"
                }`}
              >
                <td className="px-4 py-3 font-semibold text-white/90">
                  {i + 1}
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {row.name}
                  {row.isYou && (
                    <span className="ml-2 rounded-full bg-smart-green/20 px-2 py-0.5 text-xs font-semibold text-smart-green">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-white">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Return to Dashboard Button */}
      <div className="mt-10 text-center">
        <button
          className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/20"
          onClick={() => navigate("/landing", { replace: true })}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
