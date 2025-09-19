/**
 * KYLE - THIS IS THE POST ROUND (LEADERBOARD ) - YOU NEED TO ADD AN END GAME LEADER BOARD -> THIS GOES TO LANDING
 * MODAL: Pause (from Game Page)
 * Close with ✕ in modal chrome to resume
 */
export default function PauseModal() {
  return (
    <div className="space-y-3 text-center">
      <h2 className="text-xl font-semibold">Paused</h2>
      <p className="text-sm text-slate-600">Game is paused. Close to resume.</p>
    </div>
  );
}
