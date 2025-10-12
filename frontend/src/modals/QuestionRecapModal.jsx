/**
 * QuestionRecapModal - Shows results after each question.
 * Displays whether you were correct, points earned, and leaderboards.
 * Automatically returns to the game after a countdown.
 */
import { useEffect, useMemo, useState } from "react";

const colors = {
  accentA: "#32D399",
  accentD: "#FF8FAB",
};

export default function QuestionRecapModal({
  correct,
  points,
  leaderboard,
  onClose,
}) {
  const [countdown, setCountdown] = useState(5);

  // Auto-advance countdown
  useEffect(() => {
    if (countdown <= 0) return;

    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          onClose(); // Call the onClose prop instead of navigate
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [onClose]);

  // Use the props directly instead of state
  const questionIndex = 0; // You can pass this as a prop too if needed
  const leaderboardArray = Array.isArray(leaderboard) ? leaderboard : [];

  // Top 3 performers this question (by round score)
  const top3ThisQuestion = useMemo(() => {
    const rows = [...leaderboardArray];
    rows.sort(
      (a, b) =>
        (b.round ?? 0) - (a.round ?? 0) || (b.total ?? 0) - (a.total ?? 0)
    );
    return rows.slice(0, 3);
  }, [leaderboardArray]);

  // Overall standings (by total score)
  const overall = useMemo(() => {
    const rows = [...leaderboardArray];
    rows.sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
    return rows;
  }, [leaderboardArray]);

  return (
    <div
      className="w-full max-w-5xl mx-auto overflow-hidden rounded-3xl border-2 border-white p-6 text-center shadow-2xl backdrop-blur-sm sm:p-10 text-white"
      style={{ backgroundColor: "rgba(23, 64, 209, 0.7)" }}
    >
      {/* Header */}
      <header className="text-center">
        <p className="text-4xl uppercase tracking-[0.35em] font-heading font-black mb-4 mt-4 text-white/60">
          ROUND {questionIndex + 1}
        </p>
        <h2
          className="font-heading text-4xl font-black drop-shadow mb-1"
          style={{ color: correct ? "#39FF14" : "#FF073A" }}
        >
          {correct ? "You Smartie!" : '"Comeback Time"'}
        </h2>
        <p
          className="inline-flex items-center justify-center rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em]"
          style={{
            background: correct ? "#39FF14" : "#FF073A",
            color: "#000000",
          }}
        >
          {correct ? "CORRECT" : "INCORRECT"} +{points}
        </p>
      </header>

      {/* Leaderboard Section */}
      <section className="mt-10 flex flex-col items-stretch gap-6 lg:flex-row">
        {/* Top Performers Card */}
        <div
          className="flex-1 rounded-3xl shadow-lg sm:p-10 p-8"
          style={{
            backgroundColor: "rgba(0, 207, 255, 0.3)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          }}
        >
          <h3 className="text-left text-lg uppercase tracking-[0.35em] font-bold text-white">
            WINNERS OF ROUND {questionIndex + 1}
          </h3>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {(() => {
              const topPerformer = top3ThisQuestion[0];
              return (
                <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#1A335A] to-[#0F2747] text-xl font-extrabold text-smart-green shadow-lg">
                  {topPerformer ? topPerformer.name : "—"}
                </div>
              );
            })()}

            <div className="flex-1 space-y-3">
              {top3ThisQuestion.map((row, i) => {
                return (
                  <div
                    key={row.id ?? i}
                    className="flex items-center justify-between rounded-2xl border border-white/20 px-4 py-3 font-semibold shadow-sm text-white"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                        #{i + 1}
                      </span>
                      <span className="text-inherit">
                        {row.name}
                        {row.isYou && (
                          <span className="ml-2 rounded-full bg-white/30 px-2 py-0.5 text-xs font-semibold text-smart-green">
                            You
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="text-lg font-bold text-white drop-shadow-sm">
                      {row.round}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overall Standings Sidebar */}
        <aside
          className="w-full rounded-3xl shadow-lg lg:w-80 p-8 bg-smart-orange"
          style={{
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          }}
        >
          <h3 className="text-lg uppercase tracking-[0.35em] font-bold text-white">
            OVERALL WINNERS
          </h3>
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {overall.map((row, i) => (
              <div
                key={row.id ?? i}
                className="flex items-center justify-between rounded-2xl border border-white/20 px-4 py-3 font-semibold shadow-sm text-white"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-sm font-bold text-white">
                    #{i + 1}
                  </span>
                  <span className="text-inherit">
                    {row.name}
                    {row.isYou && (
                      <span className="ml-2 rounded-full bg-smart-green px-2 py-0.5 text-xs font-semibold text-white">
                        You
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-lg font-bold text-white drop-shadow-sm">
                  {row.total}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* Countdown */}
      {countdown > 0 && (
        <div className="mt-8 text-center text-base uppercase tracking-[0.3em] text-white/60 font-semibold">
          Next question in {countdown}s…
        </div>
      )}
    </div>
  );
}
