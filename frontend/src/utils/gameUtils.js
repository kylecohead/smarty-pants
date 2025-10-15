/**
 * Author: Kyle
 * Game utility functions for scoring, leaderboards, and player response management.
 * These functions handle game logic without side effects.
 */

/**
 * Calculate score based on correctness and response time.
 * Correct answers earn 10 points per second remaining.
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number} answerTimeMs - Time taken to answer in milliseconds
 * @param {number} questionDurationMs - Total time allowed for the question
 * @returns {number} Score earned for this answer
 */
export function calculateScore(isCorrect, answerTimeMs, questionDurationMs) {
  if (!isCorrect) return 0;
  // Use the same time-based scoring formula as the server
  // timeLimitMs = questionDurationMs
  // timeFactor = max(0, 1 - elapsed / timeLimitMs)
  // points = round(1 + 4 * timeFactor)
  const timeLimitMs = Math.max(1, questionDurationMs || 10000);
  const elapsed = Math.max(0, Math.min(answerTimeMs || 0, timeLimitMs));
  const timeFactor = Math.max(0, 1 - elapsed / timeLimitMs);
  // Percent-based scoring: scale to a fixed MAX_POINTS so longer timers don't
  // inflate scores. Minimum 1 point for correct answers.
  const MAX_POINTS = 10;
  return Math.max(1, Math.round(MAX_POINTS * timeFactor));
}

/**
 * Create initial score totals for all simulated players.
 * @param {Array} simulatedPlayers - Array of simulated player objects
 * @returns {Object} Map of player IDs to initial scores (0)
 */
export function createInitialSimTotals(simulatedPlayers) {
  const totals = {};
  simulatedPlayers.forEach((player) => {
    totals[player.id] = 0;
  });
  return totals;
}

/**
 * Create blank response objects for all players at the start of a question.
 * @param {string} youId - The ID for the human player
 * @param {string} youName - The display name for the human player
 * @param {Array} simulatedPlayers - Array of simulated player objects
 * @returns {Object} Map of player IDs to blank response objects
 */
export function createBlankResponses(youId, youName, simulatedPlayers) {
  const base = {
    [youId]: {
      player: { id: youId, name: youName, isYou: true },
      answered: false,
      timedOut: false,
      isCorrect: false,
      answerTimeMs: null,
      score: 0,
      selectedOptionId: null,
    },
  };

  simulatedPlayers.forEach((player) => {
    base[player.id] = {
      player: { id: player.id, name: player.name, isYou: false },
      answered: false,
      timedOut: false,
      isCorrect: false,
      answerTimeMs: null,
      score: 0,
      selectedOptionId: null,
    };
  });

  return base;
}

/**
 * Build a leaderboard for a specific question, sorted by total score.
 * @param {Object} responses - Map of player responses for the current question
 * @param {number} youTotalAfter - Human player's total score after this question
 * @param {Object} simTotalsAfter - Map of simulated player totals after this question
 * @returns {Array} Sorted leaderboard entries with round and total scores
 */
export function buildPerQuestionLeaderboard(
  responses,
  youTotalAfter,
  simTotalsAfter
) {
  const rows = Object.values(responses).map((entry) => ({
    id: entry.player.id,
    name: entry.player.name,
    round: entry.score,
    total: entry.player.isYou
      ? youTotalAfter
      : simTotalsAfter[entry.player.id] ?? 0,
    isYou: entry.player.isYou,
  }));

  rows.sort((a, b) => b.total - a.total || b.round - a.round);
  return rows;
}

/**
 * Build the final leaderboard at the end of the game.
 * @param {string} youId - The ID for the human player
 * @param {number} youTotal - Human player's final total score
 * @param {Object} simTotals - Map of simulated player final totals
 * @param {string} youName - The display name for the human player
 * @param {Array} simulatedPlayers - Array of simulated player objects
 * @returns {Array} Sorted leaderboard with final scores
 */
export function buildFinalLeaderboard(
  youId,
  youTotal,
  simTotals,
  youName,
  simulatedPlayers
) {
  const rows = [
    { id: youId, name: youName, total: youTotal, isYou: true },
    ...simulatedPlayers.map((player) => ({
      id: player.id,
      name: player.name,
      total: simTotals[player.id] ?? 0,
      isYou: false,
    })),
  ];

  rows.sort((a, b) => b.total - a.total);
  return rows;
}

/**
 * Check if all players have either answered or timed out.
 * @param {Object} responses - Map of player responses
 * @returns {boolean} True if everyone is done
 */
export function checkAllPlayersDone(responses) {
  const snapshot = Object.values(responses);
  return snapshot.every((entry) => entry.answered || entry.timedOut);
}

/**
 * Mark all unanswered players as timed out.
 * @param {Object} responses - Current responses map
 * @param {number} questionDurationMs - Full duration of the question
 * @returns {Object} Updated responses with timed-out players marked
 */
export function markUnansweredAsTimedOut(responses, questionDurationMs) {
  const next = { ...responses };
  let mutated = false;

  Object.entries(responses).forEach(([id, entry]) => {
    if (!entry.answered) {
      mutated = true;
      next[id] = {
        ...entry,
        answered: true,
        timedOut: true,
        isCorrect: false,
        answerTimeMs: questionDurationMs,
        score: 0,
      };
    }
  });

  return mutated ? next : responses;
}

/**
 * Get the duration for the current question from location state or sessionStorage.
 * @param {Object} locationState - React Router location.state object
 * @param {number} defaultSeconds - Default duration if none found
 * @returns {number} Question duration in milliseconds
 */
export function getQuestionDuration(locationState, defaultSeconds = 10) {
  const fromState = Number(locationState?.timerSeconds);
  if (Number.isFinite(fromState) && fromState > 0) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "questionDurationSeconds",
        String(fromState)
      );
    }
    return fromState * 1000;
  }

  if (typeof window !== "undefined") {
    const stored = Number(
      window.sessionStorage.getItem("questionDurationSeconds")
    );
    if (Number.isFinite(stored) && stored > 0) {
      return stored * 1000;
    }
  }

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("questionDurationSeconds", String(defaultSeconds));
  }

  return defaultSeconds * 1000;
}
