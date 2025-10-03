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
      <Link
        to="/lobby"
        className="w-fit rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-semibold tracking-wide text-white transition hover:bg-white/20"
      >
        ← Back to Lobby
      </Link>
      <div className="flex flex-col items-start sm:items-end">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">
          Score
        </p>
        <span className="font-heading text-3xl font-black text-smart-green">
          {score}
        </span>
        {!isFinished && (
          <p className="mt-1 text-xs uppercase tracking-[0.35em] text-white/40">
            Question {currentQuestion + 1} / {totalQuestions}
          </p>
        )}
        <button
          type="button"
          onClick={onQuit}
          className="mt-4 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20 sm:w-auto"
        >
          Quit
        </button>
      </div>
    </header>
  );
}
