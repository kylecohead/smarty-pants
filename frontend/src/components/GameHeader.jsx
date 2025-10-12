/**
 * Author: Kyle
 * GameHeader component - displays score, question progress, and navigation.
 */
import { Link } from "react-router-dom";

export default function GameHeader({
  score,
  currentQuestion,
  totalQuestions,
  onQuit,
}) {
  const isFinished = currentQuestion >= totalQuestions;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-start ml-8">
        <p className="text-sm uppercase tracking-[0.35em] text-white/70 font-bold">
          Score
        </p>
        <span className="font-heading text-5xl font-black text-smart-green drop-shadow-lg">
          {score}
        </span>
        {!isFinished && (
          <p className="mt-2 text-sm uppercase tracking-[0.35em] text-white/60 font-semibold">
            Question {currentQuestion + 1} / {totalQuestions}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onQuit}
        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20 sm:w-auto"
      >
        Quit Game
      </button>
    </header>
  );
}
