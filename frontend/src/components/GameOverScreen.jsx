/**
 * Author: Kyle
 * GameOverScreen component - displays final results and leaderboard.
 */
import { Link } from "react-router-dom";
import backgroundFinalScore from "../assets/background_finalScore.jpg";

export default function GameOverScreen({ winner, score, finalLeaderboard }) {
  const titleLetters = [
    { t: "T", c: "text-smart-green" },
    { t: "H", c: "text-smart-orange" },
    { t: "E", c: "text-smart-light-blue" },
    { t: " ", c: "" },
    { t: "U", c: "text-smart-light-pink" },
    { t: "L", c: "text-smart-green" },
    { t: "T", c: "text-smart-red" },
    { t: "I", c: "text-smart-purple" },
    { t: "M", c: "text-smart-light-blue" },
    { t: "A", c: "text-smart-yellow" },
    { t: "T", c: "text-smart-green" },
    { t: "E", c: "text-smart-pink" },
    { t: " ", c: "" },
    { t: "S", c: "text-smart-green" },
    { t: "M", c: "text-smart-orange" },
    { t: "A", c: "text-smart-light-blue" },
    { t: "R", c: "text-smart-light-pink" },
    { t: "T", c: "text-smart-green" },
    { t: "I", c: "text-smart-red" },
    { t: "E", c: "text-smart-purple" },
    { t: " ", c: "" },
    { t: "P", c: "text-smart-light-blue" },
    { t: "A", c: "text-smart-yellow" },
    { t: "N", c: "text-smart-green" },
    { t: "T", c: "text-smart-pink" },
    { t: "S", c: "text-smart-dark-blue" },
  ];

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${backgroundFinalScore})` }}
    >
      <div
        className="w-full max-w-4xl rounded-3xl border-2 border-white p-8 text-white shadow-2xl backdrop-blur-sm text-center"
        style={{ backgroundColor: "#1740d1ff" }}
      >
        {/* Header */}
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Trivia Showdown
          </p>
          <h2
            className="mt-2 font-heading text-6xl font-black drop-shadow"
            style={{
              textShadow:
                "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)",
            }}
          >
            {titleLetters.map((l, i) => (
              <span key={i} className={l.c}>
                {l.t.toUpperCase()}
              </span>
            ))}
          </h2>
          <p className="mt-3 text-lg uppercase tracking-[0.3em] text-white/70">
            {winner?.isYou ? "You did it!" : `${winner?.name} takes the crown`}
          </p>
        </header>

        {/* Winner Display */}
        <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-lg bg-smart-orange">
          {winner?.name}
        </div>

        {/* Your Score */}
        <p className="mt-6 text-center text-xl text-white/80">
          Your Score:{" "}
          <span className="font-heading text-5xl text-smart-green">
            {score}
          </span>
        </p>

        {/* Final Leaderboard */}
        <section className="mt-10 overflow-hidden rounded-2xl shadow-lg bg-smart-orange">
          <table className="w-full border-collapse text-left text-sm sm:text-base">
            <thead className="bg-black/20 uppercase tracking-[0.25em] text-white">
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
                  className={`border-t border-white/20 ${
                    row.isYou ? "bg-black/10" : "bg-transparent"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-white">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {row.name}
                    {row.isYou && (
                      <span className="ml-2 rounded-full bg-smart-green/80 px-2 py-0.5 text-xs font-semibold text-white">
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
          <Link
            to="/landing"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/20"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
