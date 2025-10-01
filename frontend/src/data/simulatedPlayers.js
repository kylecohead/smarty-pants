// Hard coded players to simulate a multiplayer leaderboard during dev.
// Each player now includes answer timing metadata so we can derive scores at runtime.
// This makes it easier to swap in real-time socket events later.

/** @typedef {{ timeToAnswerMs: number, isCorrect: boolean }} SimulatedAnswer */
/** @typedef {{ id: string, name: string, answers: SimulatedAnswer[] }} SimPlayer */

/** @type {SimPlayer[]} */
export const SIMULATED_PLAYERS = [
  {
    id: "p2",
    name: "Alex",
    answers: [
      { timeToAnswerMs: 3500, isCorrect: true },
      { timeToAnswerMs: 9200, isCorrect: false },
      { timeToAnswerMs: 7200, isCorrect: true },
      { timeToAnswerMs: 2800, isCorrect: true },
      { timeToAnswerMs: 6300, isCorrect: true },
      { timeToAnswerMs: 2100, isCorrect: true },
      { timeToAnswerMs: 5800, isCorrect: true },
      { timeToAnswerMs: 10400, isCorrect: true },
      { timeToAnswerMs: 3000, isCorrect: true },
      { timeToAnswerMs: 4500, isCorrect: true },
      { timeToAnswerMs: 8700, isCorrect: true },
      { timeToAnswerMs: 500, isCorrect: true },
    ],
  },
  {
    id: "p3",
    name: "Sam",
    answers: [
      { timeToAnswerMs: 6100, isCorrect: true },
      { timeToAnswerMs: 4300, isCorrect: true },
      { timeToAnswerMs: 8400, isCorrect: true },
      { timeToAnswerMs: 9600, isCorrect: false },
      { timeToAnswerMs: 3100, isCorrect: true },
      { timeToAnswerMs: 5200, isCorrect: true },
      { timeToAnswerMs: 7800, isCorrect: false },
      { timeToAnswerMs: 2700, isCorrect: true },
      { timeToAnswerMs: 1500, isCorrect: true },
      { timeToAnswerMs: 10800, isCorrect: true },
      { timeToAnswerMs: 5400, isCorrect: true },
      { timeToAnswerMs: 8900, isCorrect: false },
    ],
  },
  {
    id: "p4",
    name: "Jamie",
    answers: [
      { timeToAnswerMs: 1200, isCorrect: true },
      { timeToAnswerMs: 6400, isCorrect: true },
      { timeToAnswerMs: 10900, isCorrect: true },
      { timeToAnswerMs: 5000, isCorrect: true },
      { timeToAnswerMs: 7200, isCorrect: false },
      { timeToAnswerMs: 4500, isCorrect: true },
      { timeToAnswerMs: 9800, isCorrect: true },
      { timeToAnswerMs: 3300, isCorrect: true },
      { timeToAnswerMs: 2800, isCorrect: true },
      { timeToAnswerMs: 4000, isCorrect: true },
      { timeToAnswerMs: 7600, isCorrect: true },
      { timeToAnswerMs: 11200, isCorrect: true },
    ],
  },
];