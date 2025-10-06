/**
 * Author: Kyle
 * GameOverScreen component - displays final results and leaderboard.
 */
import { Link } from "react-router-dom";

export default function GameOverScreen({ winner, score, finalLeaderboard }) {
  return (
    <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-12">
      <h2 className="font-heading text-4xl font-black text-smart-light-blue">
        Smartie Pants Champion
      </h2>
      <p className="mt-2 text-lg uppercase tracking-[0.3em] text-white/60">
        {winner?.isYou ? "You did it!" : `${winner?.name} takes the crown`}
      </p>

      <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-extrabold text-white shadow-lg">
        {winner?.name}
      </div>

      <p className="mt-6 text-lg text-white/80">
        Your Score:{" "}
        <span className="font-heading text-3xl text-smart-green">{score}</span>
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full border-collapse text-left text-sm sm:text-base">
          <thead className="bg-white/10 uppercase tracking-[0.25em] text-white/60">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {finalLeaderboard.map((row, i) => (
              <tr
                key={row.id}
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
      </div>

      <Link
        to="/"
        className="mt-10 inline-block rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/20"
      >
        Return Home
      </Link>
    </div>
  );
}
