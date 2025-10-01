/**
 * PauseModal — Question recap between questions.
 *
 * State passed from PlayGame via route state:
 * {
 *   mode: 'recap',
 *   correct: boolean,
 *   points: number,
 *   questionIndex: number,
 *   leaderboard: Array<{ id, name, round, total, isYou }>,
 *   nextInSeconds: number,
 * }
 *
 * DESIGN HOOKS:
 * - Outer card and overlay are in App.jsx.
 * - Tweak Tailwind classes below; look for DESIGN comments.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RECAP_DELAY_SECONDS, FINAL_DELAY_SECONDS } from "../config/gameConfig";

const colors = {
  accentA: "#32D399",
  accentB: "#6EC5FF",
  accentC: "#FFC857",
  accentD: "#FF8FAB",
  card: "rgba(255, 255, 255, 0.08)",
};

export default function PauseModal() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mode = state?.mode ?? "paused";
  const correct = state?.correct ?? false;
  const points = state?.points ?? 0;
  const questionIndex = state?.questionIndex ?? 0;
  const leaderboard = Array.isArray(state?.leaderboard)
    ? state.leaderboard
    : [];
  const yourScore = state?.yourScore;
  const initialCountdown =
    mode === "final"
      ? state?.nextInSeconds ?? FINAL_DELAY_SECONDS
      : state?.nextInSeconds ?? RECAP_DELAY_SECONDS;
  const [countdown, setCountdown] = useState(initialCountdown);

  useEffect(() => {
    if (mode !== "recap") return;
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
  }, [mode, initialCountdown, navigate]);

  const top3ThisQuestion = useMemo(() => {
    const rows = [...leaderboard];
    rows.sort(
      (a, b) =>
        (b.round ?? 0) - (a.round ?? 0) || (b.total ?? 0) - (a.total ?? 0)
    );
    return rows.slice(0, 3);
  }, [leaderboard]);

  const overall = useMemo(() => {
    const rows = [...leaderboard];
    rows.sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
    return rows;
  }, [leaderboard]);

  if (mode === "final") {
    const winner = leaderboard[0];
    return (
      <div className="w-full text-white">
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

        <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-extrabold text-white shadow-lg">
          {winner?.isYou ? "You" : winner?.name}
        </div>

        {typeof yourScore === "number" && (
          <p className="mt-6 text-center text-lg text-white/80">
            Your Score:{" "}
            <span className="font-heading text-3xl text-smart-green">
              {yourScore}
            </span>
          </p>
        )}

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

        <div className="mt-10 text-center">
          <button
            className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/20"
            onClick={() => navigate("/landing")}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (mode !== "recap") {
    return (
      <div className="text-center w-full">
        <h2 className="text-2xl font-semibold">Paused</h2>
        <p className="text-base text-slate-600">
          Game is paused. Close to resume.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
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

      <section className="mt-10 flex flex-col items-stretch gap-6 lg:flex-row">
        <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <h3 className="text-left text-xs uppercase tracking-[0.35em] text-white/50">
            Top Performers This Round
          </h3>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {(() => {
              const topPerformer = top3ThisQuestion[0];
              return (
                <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#1A335A] to-[#0F2747] text-xl font-extrabold text-smart-green shadow-lg">
                  {topPerformer
                    ? topPerformer.isYou
                      ? "You"
                      : topPerformer.name
                    : "—"}
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
                    <span className={`flex items-center gap-3`}>
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

      {initialCountdown > 0 && (
        <div className="mt-8 text-center text-sm uppercase tracking-[0.3em] text-white/60">
          Next question in {countdown}s…
        </div>
      )}
    </div>
  );
}
