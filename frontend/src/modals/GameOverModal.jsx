/**
 * GameOverModal - Final game results screen.
 * Displays the winner, final leaderboard, and option to return home.
 */
import { useLocation, useNavigate } from "react-router-dom";
import backgroundFinalScore from "../assets/background_finalScore.jpg";

export default function GameOverModal({ scores, currentUser, onClose }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Use props if available, otherwise fall back to navigation state
  const finalScores = scores || state?.scores || {};
  const user = currentUser || state?.currentUser;

  // Convert scores object to leaderboard array if needed
  const leaderboard =
    state?.leaderboard ||
    (finalScores
      ? Object.entries(finalScores)
          .map(([name, score]) => ({
            name,
            total: score,
            isYou: name === user?.username,
          }))
          .sort((a, b) => b.total - a.total)
      : []);

  const yourScore = user ? finalScores[user.username] : state?.yourScore;
  const winner = leaderboard[0];

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
        className="w-full max-w-4xl rounded-3xl border-2 border-white p-8 text-white shadow-2xl backdrop-blur-sm"
        style={{ backgroundColor: "#1740d1ff" }}
      >
        {/* Header */}
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Trivia Showdown
          </p>
          <h2
            className="mt-2 font-heading text-4xl font-black drop-shadow"
            style={{
              textShadow:
                "2px 2px 4px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.6)",
            }}
          >
            {titleLetters.map((l, i) => (
              <span key={i} className={l.c}>
                {l.t.toUpperCase()}
              </span>
            ))}
          </h2>
          <p className="mt-3 text-lg uppercase tracking-[0.3em] text-white/70">
            {winner?.isYou ? "You" : winner?.name} takes the crown
          </p>
        </header>

        {/* Winner Display */}
        <div
          className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-lg"
          style={{ backgroundColor: "rgba(255, 255, 0, 0.6)" }}
        >
          {winner?.isYou ? "You" : winner?.name}
        </div>

        {/* Your Score */}
        {typeof yourScore === "number" && (
          <p className="mt-6 text-center text-xl text-white/80">
            Your Score:{" "}
            <span className="font-heading text-5xl text-smart-green">
              {yourScore}
            </span>
          </p>
        )}

        {/* Final Leaderboard */}
        <section
          className="mt-10 overflow-hidden rounded-2xl shadow-lg"
          style={{ backgroundColor: "rgba(255, 255, 0, 0.6)" }}
        >
          <table className="w-full border-collapse text-left text-sm sm:text-base">
            <thead className="bg-black/20 uppercase tracking-[0.25em] text-black">
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
                  className={`border-t border-black/20 ${
                    row.isYou ? "bg-black/10" : "bg-transparent"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-black">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-black">
                    {row.name}
                    {row.isYou && (
                      <span className="ml-2 rounded-full bg-smart-green/80 px-2 py-0.5 text-xs font-semibold text-white">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-black">
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
            onClick={onClose || (() => navigate("/landing", { replace: true }))}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
