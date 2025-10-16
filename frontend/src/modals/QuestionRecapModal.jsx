/**
 * QuestionRecapModal - Classic style with modern features.
 * Keeps original visual style (rounded blue panel, large headings)
 * while adding correct answer display and improved sorting logic.
 */
import { useEffect, useMemo, useState } from "react";

const colors = {
  correct: "#39FF14",
  incorrect: "#FF073A",
  bgPanel: "rgba(23, 64, 209, 0.7)",
  blueCard: "rgba(0, 207, 255, 0.3)",
  blackOverlay: "rgba(0, 0, 0, 0.1)",
};

export default function QuestionRecapModal({
  correct,
  points,
  leaderboard,
  onClose,
  correctAnswer,
  questionIndex = 0,
}) {
  const [countdown, setCountdown] = useState(5);

  // Countdown to auto-close modal
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose, countdown]);

  const leaderboardArray = Array.isArray(leaderboard) ? leaderboard : [];

  // Top 3 performers for this question (by round score)
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
      style={{ backgroundColor: colors.bgPanel }}
    >
      {/* Header */}
      <header className="text-center">
        <p className="text-4xl uppercase tracking-[0.35em] font-heading font-black mb-4 mt-4 text-white/60">
          ROUND {questionIndex + 1}
        </p>
        <h2
          className="font-heading text-4xl font-black drop-shadow mb-1"
          style={{ color: correct ? colors.correct : colors.incorrect }}
        >
          {correct ? "You Smartie!" : "Comeback Time"}
        </h2>
        <p
          className="inline-flex items-center justify-center rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em]"
          style={{
            background: correct ? colors.correct : colors.incorrect,
            color: "#000000",
          }}
        >
          {correct ? "CORRECT" : "INCORRECT"} +{points}
        </p>
      </header>

      {/* Correct Answer Display */}
      {correctAnswer != null && (
        <div className="mt-6 text-center" aria-live="polite">
          <p className="text-xs text-white/60 uppercase">Correct Answer</p>
          <div className="mx-auto mt-2 inline-block rounded-xl bg-emerald-300 px-4 py-2 font-semibold text-black shadow-2xl ring-4 ring-emerald-100 text-lg">
            {correctAnswer}
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <section className="mt-10 flex flex-col items-stretch gap-6 lg:flex-row">
        {/* Top Performers Card */}
        <div
          className="flex-1 rounded-3xl shadow-lg sm:p-10 p-8"
          style={{
            backgroundColor: colors.blueCard,
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
                <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-white/20 bg-black/20 text-xl font-extrabold text-smart-green shadow-lg">
                  {topPerformer ? topPerformer.name : "—"}
                </div>
              );
            })()}

            <div className="flex-1 space-y-3">
              {top3ThisQuestion.map((row, i) => (
                <div
                  key={row.id ?? i}
                  className="flex items-center justify-between rounded-2xl border border-white/20 px-4 py-3 font-semibold shadow-sm text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
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
                    {row.round}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Standings Sidebar */}
        <aside
          className="w-full rounded-3xl shadow-lg lg:w-80 p-8 bg-smart-orange"
          style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
        >
          <h3 className="text-lg uppercase tracking-[0.35em] font-bold text-white">
            OVERALL WINNERS
          </h3>
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {overall.map((row, i) => (
              <div
                key={row.id ?? i}
                className="flex items-center justify-between rounded-2xl border border-white/20 px-4 py-3 font-semibold shadow-sm text-white"
                style={{ backgroundColor: colors.blackOverlay }}
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
