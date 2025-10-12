/**
 * PauseModal - Router component that delegates to appropriate modal.
 *
 * Routes to:
 * - QuestionRecapModal: After each question (mode: 'recap')
 * - GameOverModal: After final question (mode: 'final')
 * - Fallback paused state for any other mode
 */
import { useLocation } from "react-router-dom";
import QuestionRecapModal from "./QuestionRecapModal";
import GameOverModal from "./GameOverModal";

export default function PauseModal() {
  const { state } = useLocation();
  const mode = state?.mode ?? "paused";

  // Route to final game over screen
  if (mode === "final") {
    return <GameOverModal />;
  }

  // Route to question recap screen
  if (mode === "recap") {
    return (
      <QuestionRecapModal
        correct={state?.correct}
        points={state?.points}
        leaderboard={state?.leaderboard}
        allResponses={state?.allResponses}
        questionIndex={state?.questionIndex}
        onClose={state?.onClose}
      />
    );
  }

  // Fallback for generic pause state
  return (
    <div className="w-full text-center">
      <h2 className="text-2xl font-semibold">Paused</h2>
      <p className="text-base text-slate-600">
        Game is paused. Close to resume.
      </p>
    </div>
  );
}
