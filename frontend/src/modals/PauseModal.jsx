/**
 * PauseModal — repurposed as the Question Recap modal shown between questions.
 * How it works:
 * - PlayGame navigates to the nested route "pause" with a state payload:
 *   { mode: 'recap', correct, points, questionText, correctAnswer, nextInSeconds }
 * - When mode === 'recap', this component displays the result of the last question
 *   and starts a countdown (unless nextInSeconds is 0 for the last question).
 * - When the countdown ends (or is 0), we auto-navigate back one level ("..")
 *   which closes the modal and reveals the next question or the final results screen.
 */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PauseModal() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mode = state?.mode ?? "paused";
  const correct = state?.correct ?? false;
  const points = state?.points ?? 0;
  const questionText = state?.questionText ?? "";
  const correctAnswer = state?.correctAnswer ?? "";
  const initialCountdown = state?.nextInSeconds ?? 3;
  const [countdown, setCountdown] = useState(initialCountdown);

  // Auto-close (navigate back) after countdown in recap mode
  useEffect(() => {
    if (mode !== "recap") return;
    setCountdown(initialCountdown);
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

  return (
    <div className="space-y-6 text-center">
      {mode === "recap" ? (
        <>
          <div
            className={`text-4xl sm:text-5xl font-extrabold ${
              correct ? "text-green-600" : "text-red-600"
            }`}
          >
            {correct ? "Correct!" : "Incorrect"}
          </div>
          <div className="text-3xl font-extrabold">
            Points earned: <span className="">{points}</span>
          </div>
          {initialCountdown > 0 && (
            <div className="text-xl text-slate-600">
              Next question in {countdown}s…
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold">Paused</h2>
          <p className="text-base text-slate-600">
            Game is paused. Close to resume.
          </p>
        </>
      )}
    </div>
  );
}
