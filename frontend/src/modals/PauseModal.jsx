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
      <div className="w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            The Ultimate: Smartie Pants
          </h2>
          <p className="text-2xl font-extrabold mt-1">
            {winner?.isYou ? "You" : winner?.name}
          </p>
          {/* DESIGN: avatar placeholder */}
          <div className="mx-auto mb-4 mt-4 h-32 w-32 border-2 border-smart-green rounded-xl flex items-center justify-center text-2xl font-bold">
            {winner?.isYou ? "You!" : winner?.name}
          </div>
          {typeof yourScore === "number" && (
            <p className="text-lg text-slate-700">Your Score: {yourScore}</p>
          )}
        </div>

        {/* Final leaderboard */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-slate-600">
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className={`${row.isYou ? "bg-green-50" : "bg-white"}`}
                >
                  <td className="px-3 py-2 font-semibold">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">
                    {row.name}
                    {row.isYou && (
                      <span className="ml-2 text-xs text-green-700 font-semibold">
                        (You)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-bold">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DESIGN: Optional action row for closing */}
        <div className="mt-6 text-center">
          <button
            className="inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-lg hover:bg-slate-100"
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
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold">
          Round {questionIndex + 1} Results
        </h2>
        <div
          className={`mt-2 text-xl font-bold ${
            correct ? "text-green-600" : "text-red-600"
          }`}
        >
          {correct ? "Correct" : "Incorrect"} + {points}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col sm:flex-row gap-6 items-stretch">
        {/* Main block: top 3 this question */}
        <div className="flex-1 rounded-2xl border p-6 bg-white">
          {/* Highlight: top performer for this question */}
          {(() => {
            const topPerformer = top3ThisQuestion[0];
            return (
              <div className="mx-auto mb-6 h-40 w-40 border-2 border-smart-green rounded-xl flex items-center justify-center text-2xl font-bold">
                {topPerformer
                  ? topPerformer.isYou
                    ? "You!"
                    : topPerformer.name
                  : "—"}
              </div>
            );
          })()}
          <div className="space-y-3">
            {top3ThisQuestion.map((row, i) => {
              const colors = [
                "bg-yellow-300 text-black",
                "bg-slate-200 text-slate-900",
                "bg-orange-300 text-black",
              ];
              const cls = colors[i] ?? "bg-white";
              return (
                <div
                  key={row.id ?? i}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border ${cls}`}
                >
                  <div className="font-semibold">
                    #{i + 1} {row.name}
                    {row.isYou ? " (You)" : ""}
                  </div>
                  <div className="font-bold">{row.round}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: overall leaderboard */}
        <aside className="sm:w-72 w-full rounded-2xl border p-4 bg-white">
          <h3 className="text-lg font-semibold mb-3">Leaderboard</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {overall.map((row, i) => (
              <div
                key={row.id ?? i}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  row.isYou ? "bg-green-50" : "bg-white"
                }`}
              >
                <div className="font-medium">
                  #{i + 1} {row.name}
                  {row.isYou && (
                    <span className="ml-1 text-xs text-green-700 font-semibold">
                      (You)
                    </span>
                  )}
                </div>
                <div className="font-bold">{row.total}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {initialCountdown > 0 && (
        <div className="text-xl text-slate-600 mt-6 text-center">
          Next question in {countdown}s…
        </div>
      )}
    </div>
  );
}
