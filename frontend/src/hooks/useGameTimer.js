/**
 * Author: Kyle
 * Custom hook to manage the game timer for each question.
 * Handles countdown and cleanup.
 * Uses real-time calculation to continue accurately even when tab is inactive.
 */
import { useEffect, useState, useRef } from "react";

const TIMER_TICK_MS = 100;

/**
 * @param {number} questionDurationMs - Duration of the question in milliseconds
 * @param {number} questionIndex - Current question index (triggers reset)
 * @param {boolean} isRecapOpen - Whether the recap modal is open
 * @param {boolean} finished - Whether the game is finished
 * @returns {Object} { timeLeftMs, questionStartRef }
 */
export function useGameTimer(
  questionDurationMs,
  questionIndex,
  isRecapOpen,
  finished
) {
  const [timeLeftMs, setTimeLeftMs] = useState(questionDurationMs);
  const questionStartRef = useRef(Date.now());
  const endTimeRef = useRef(Date.now() + questionDurationMs);

  useEffect(() => {
    if (finished || isRecapOpen) return undefined;

    // Reset for new question - use real timestamps
    const startTime = Date.now();
    questionStartRef.current = startTime;
    endTimeRef.current = startTime + questionDurationMs;
    setTimeLeftMs(questionDurationMs);

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTimeRef.current - now);
      
      setTimeLeftMs(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, TIMER_TICK_MS);

    return () => {
      clearInterval(interval);
    };
  }, [questionIndex, finished, isRecapOpen, questionDurationMs]);

  return {
    timeLeftMs,
    questionStartRef,
  };
}
