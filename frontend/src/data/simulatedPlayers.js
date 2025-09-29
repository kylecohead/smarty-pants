// Hard coded players to simulate a multiplayer leaderboard during dev.
// Each player has a fixed score for each question index. Values should be in
// multiples of 10 (0..100) to mirror our scoring (10 points per second left, 10s max).

/** @typedef {{ id: string, name: string, scoresPerQuestion: number[] }} SimPlayer */

/** @type {SimPlayer[]} */
export const SIMULATED_PLAYERS = [
  {
    id: "p2",
    name: "Alex",
    scoresPerQuestion: [60, 0, 30, 70, 40],
  },
  {
    id: "p3",
    name: "Sam",
    scoresPerQuestion: [20, 50, 40, 10, 80],
  },
  {
    id: "p4",
    name: "Jamie",
    scoresPerQuestion: [100, 30, 0, 50, 60],
  },
];