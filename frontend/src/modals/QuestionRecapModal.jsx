/**
 * QuestionRecapModal - Shows results after each question.
 * Displays whether you were correct, points earned, and leaderboards.
 * Automatically returns to the game after a countdown.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RECAP_DELAY_SECONDS } from "../config/gameConfig";

const colors = {
  accentA: "#32D399",
  accentD: "#FF8FAB",
};

export default function QuestionRecapModal() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const correct = state?.correct ?? false;
  const points = state?.points ?? 0;
  const questionIndex = state?.questionIndex ?? 0;
  const leaderboard = Array.isArray(state?.leaderboard)
    ? state.leaderboard
    : [];
  const initialCountdown = state?.nextInSeconds ?? RECAP_DELAY_SECONDS;

  const [countdown, setCountdown] = useState(initialCountdown);

  // Auto-advance countdown
  useEffect(() => {
    setCountdown(initialCountdown);
    if (initialCountdown <= 0) return;

    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          navigate("..", { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [initialCountdown, navigate]);

  // Top 3 performers this question (by round score)
  const top3ThisQuestion = useMemo(() => {
    const rows = [...leaderboard];
    rows.sort(
      (a, b) =>
        (b.round ?? 0) - (a.round ?? 0) || (b.total ?? 0) - (a.total ?? 0)
    );
    return rows.slice(0, 3);
  }, [leaderboard]);

  // Overall standings (by total score)
  const overall = useMemo(() => {
    const rows = [...leaderboard];
    rows.sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
    return rows;
  }, [leaderboard]);

  return (
    <div className="w-full text-white">
      {/* Header */}
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">
          Round {questionIndex + 1}
        </p>
        <h2 className="mt-2 font-heading text-4xl font-black text-smart-light-blue drop-shadow">
          {correct ? "Victory Pulse" : "Comeback Time"}
        </h2>
        <p
          className="mt-3 inline-flex items-center justify-center rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em]"
          style={{
            background: correct ? colors.accentA : colors.accentD,
            color: correct ? "#092C1F" : "#460017",
          }}
        >
          {correct ? "Correct" : "Incorrect"} · +{points}
        </p>
      </header>

      {/* Leaderboard Section */}
      <section className="mt-10 flex flex-col items-stretch gap-6 lg:flex-row">
        {/* Top Performers Card */}
        <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <h3 className="text-left text-xs uppercase tracking-[0.35em] text-white/50">
            Top Performers This Round
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
                const gradients = [
                  "from-[#FFC857] to-[#FFAE42] text-slate-900",
                  "from-[#6EC5FF] to-[#4F8CFF] text-white",
                  "from-[#32D399] to-[#0FB57D] text-white",
                ];
                const gradient =
                  gradients[i] ?? "from-[#1A3155] to-[#102743] text-white";
                return (
                  <div
                    key={row.id ?? i}
                    className={`flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-r px-4 py-3 font-semibold shadow-sm ${gradient}`}
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
        <aside className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm lg:w-80">
          <h3 className="text-xs uppercase tracking-[0.35em] text-white/50">
            Overall Standings
          </h3>
          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
            {overall.map((row, i) => (
              <div
                key={row.id ?? i}
                className={`flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-white ${
                  row.isYou ? "bg-white/20" : "bg-white/10"
                }`}
              >
                <span className="font-medium">
                  #{i + 1} {row.name}
                  {row.isYou && (
                    <span className="ml-2 rounded-full bg-white/30 px-2 py-0.5 text-xs font-semibold text-white">
                      You
                    </span>
                  )}
                </span>
                <span className="text-sm font-bold text-white/90">
                  {row.total}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* Countdown */}
      {initialCountdown > 0 && (
        <div className="mt-8 text-center text-sm uppercase tracking-[0.3em] text-white/60">
          Next question in {countdown}s…
        </div>
      )}
    </div>
  );
}
