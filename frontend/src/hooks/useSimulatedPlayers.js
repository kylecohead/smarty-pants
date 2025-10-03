/**
 * Author: Kyle
 * Custom hook to manage simulated player answers.
 * Schedules their responses based on timing metadata and handles cleanup.
 */
import { useEffect, useRef } from "react";

/**
 * @param {Array} simulatedPlayers - Array of simulated player objects
 * @param {number} questionIndex - Current question index
 * @param {number} questionDurationMs - Duration of the question in milliseconds
 * @param {boolean} isRecapOpen - Whether the recap modal is open
 * @param {boolean} finished - Whether the game is finished
 * @param {Function} onSimulatedAnswer - Callback when a simulated player answers
 * @returns {Object} { clearSimulatedTimers }
 */
export function useSimulatedPlayers(
  simulatedPlayers,
  questionIndex,
  questionDurationMs,
  isRecapOpen,
  finished,
  onSimulatedAnswer
) {
  const simTimeoutsRef = useRef([]);
  const callbackRef = useRef(onSimulatedAnswer);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onSimulatedAnswer;
  }, [onSimulatedAnswer]);

  function clearSimulatedTimers() {
    simTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    simTimeoutsRef.current = [];
  }

  useEffect(() => {
    if (finished || isRecapOpen) return undefined;

    clearSimulatedTimers();

    const timers = [];
    simulatedPlayers.forEach((player) => {
      const answer = player.answers[questionIndex];
      if (!answer) return;
      if (answer.timeToAnswerMs >= questionDurationMs) return;

      const timeoutId = setTimeout(() => {
        callbackRef.current(player.id, {
          isCorrect: answer.isCorrect,
          answerTimeMs: answer.timeToAnswerMs,
        });
      }, Math.max(0, answer.timeToAnswerMs));
      
      timers.push(timeoutId);
    });

    simTimeoutsRef.current = timers;

    return () => {
      clearSimulatedTimers();
    };
  }, [
    simulatedPlayers,
    questionIndex,
    questionDurationMs,
    isRecapOpen,
    finished,
  ]);

  return {
    clearSimulatedTimers,
  };
}
