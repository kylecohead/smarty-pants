/**
 * KYLE — Game Page (Spec #7)
 * Ultra-minimal gameplay screen:
 * - Question text
 * - 4 big answer buttons (click = submit)
 * - Pause button and Back to Lobby button only
 * Tracks how many answers are correct and shows a simple end screen.
 */
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { QUESTIONS } from "../data/questions";

// Main gameplay screen. Renders either the active question or a final results card.
// Game rules implemented here:
// - Each question has 10s to answer. A top progress bar shows remaining time.
// - If the player selects the correct option, they earn 10 points per full second remaining.
// - If time runs out or they choose incorrectly, they earn 0 for that question.
// - After answering (or timeout) we show a recap modal for ~3s (last question shows no countdown),
//   then auto-advance to the next question (or results if it was the last one).
export default function PlayGame() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0); // total accumulated score
  const [timeLeftMs, setTimeLeftMs] = useState(10000); // countdown per question in ms
  const [pendingAdvance, setPendingAdvance] = useState(false); // flag to advance after recap closes
  const navigate = useNavigate();
  const location = useLocation();
  const isRecapOpen = location.pathname.endsWith("/pause"); // when true, a recap modal is showing
  const total = QUESTIONS.length;
  const finished = index >= total; // entire round finished
  const question = finished ? null : QUESTIONS[index]; // active question

  // Called when player clicks an option button
  function handleAnswer(optionId) {
    if (finished || !question || isRecapOpen) return;
    const isCorrect = optionId === question.correctId;
    const secondsLeft = Math.floor(timeLeftMs / 1000);
    const earned = isCorrect ? secondsLeft * 10 : 0;
    if (earned > 0) setScore((s) => s + earned);

    // Open recap modal and pass data via route state for PauseModal to render
    const correctOption = question.options.find(
      (o) => o.id === question.correctId
    );
    navigate("pause", {
      state: {
        mode: "recap",
        correct: isCorrect,
        points: earned,
        questionText: question.text,
        correctAnswer: correctOption?.label,
        nextInSeconds: index === total - 1 ? 0 : 3,
      },
    });
    setPendingAdvance(true);
  }

  // Start/reset a 10-second timer for each question.
  // Smoothly updates every 100ms to animate the progress bar.
  // If it reaches zero while no answer was given, we open a recap with 0 points.
  useEffect(() => {
    if (finished || isRecapOpen) return; // pause timer during recap
    const duration = 10000; // 10s in ms
    const step = 100; // update every 100ms for smoother bar
    setTimeLeftMs(duration);
    const interval = setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev <= step) {
          clearInterval(interval);
          // Time ran out: show recap with 0 points
          if (!finished) {
            const correctOption = question?.options.find(
              (o) => o.id === question?.correctId
            );
            navigate("pause", {
              state: {
                mode: "recap",
                correct: false,
                points: 0,
                questionText: question?.text,
                correctAnswer: correctOption?.label,
                nextInSeconds: index === total - 1 ? 0 : 3,
              },
            });
            setPendingAdvance(true);
          }
          return 0;
        }
        return prev - step;
      });
    }, step);
    return () => clearInterval(interval);
  }, [index, finished, isRecapOpen]);

  // When recap modal closes and we have a pending advance, go to next question
  useEffect(() => {
    if (!isRecapOpen && pendingAdvance) {
      setPendingAdvance(false);
      setIndex((i) => i + 1);
    }
  }, [isRecapOpen, pendingAdvance]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar: both buttons on the right */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-b">
        <Link
          to="/lobby"
          className="rounded-lg border px-3 py-1.5 hover:bg-slate-100"
        >
          ← Back to Lobby
        </Link>
      </div>

      {/* Centered card with big question and colored answers */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {!finished ? (
          <div className="relative w-full max-w-4xl rounded-2xl border-2 border-smart-green shadow-lg p-10 text-center min-h-[28rem]">
            {/* Sliding progress bar across full width */}
            <div className="mb-8 h-4 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-smart-green transition-[width] duration-100 ease-linear"
                style={{ width: `${(timeLeftMs / 10000) * 100}%` }}
              />
            </div>
            {/* No heading label; just the question, big and bold */}
            <p className="text-5xl sm:text-6xl font-extrabold mb-8">
              {question.text}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {question.options.map((opt, i) => {
                const colorClasses = [
                  "bg-red-500 hover:bg-red-600 text-white",
                  "bg-blue-500 hover:bg-blue-600 text-white",
                  "bg-yellow-400 hover:bg-yellow-500 text-black",
                  "bg-green-500 hover:bg-green-600 text-white",
                ];
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt.id)}
                    className={`rounded-2xl px-8 py-10 text-2xl font-bold ${
                      colorClasses[i % colorClasses.length]
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl rounded-2xl border shadow-sm p-8 text-center">
            <p className="text-4xl font-bold mb-6">
              The Ultimate: Smartie Pants
            </p>
            {/* Avatar placeholder */}
            <div className="mx-auto mb-6 mt-2 h-32 w-32 border-2 border-smart-green rounded-xl flex items-center justify-center text-2xl font-bold">
              You!
            </div>
            <p className="text-xl mb-8">Score: {score}</p>
            <Link
              to="/landing"
              className="inline-block rounded-lg border px-5 py-3 text-lg hover:bg-slate-100"
            >
              Return Home
            </Link>
          </div>
        )}
      </main>

      {/* Pause modal outlet */}
      <Outlet />
    </div>
  );
}
