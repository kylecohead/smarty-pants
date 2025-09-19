/**
 * AMY - RIGHT NOW ITS A BUTTON
 * MODAL: Round Number (from Lobby)
 * Opens at /lobby/round
 * Close with ✕ in modal chrome
 */
export default function RoundModal() {
  // placeholder round display
  const currentRound = 1;
  return (
    <div className="space-y-3 text-center">
      <h2 className="text-xl font-semibold">Round Information</h2>
      <p className="text-sm text-slate-600">
        Current Round: <span className="font-semibold">{currentRound}</span>
      </p>
    </div>
  );
}
