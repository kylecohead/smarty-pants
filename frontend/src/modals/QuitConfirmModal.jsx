/**
 * QuitConfirmModal: Confirmation dialog for quitting a game.
 * Warns users that their stats will be discarded if they quit before completion.
 */

export default function QuitConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="w-full max-w-md text-white p-6">
      {/* Warning Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-smart-red/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-smart-red"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-center font-heading text-2xl font-bold text-white mb-3">
        Quit Game?
      </h2>

      {/* Warning Message */}
      <div className="bg-smart-red/10 border border-smart-red/30 rounded-lg p-4 mb-6">
        <p className="text-center text-white/90 text-sm leading-relaxed">
          If you quit now, all stats from this game will be{" "}
          <span className="font-bold text-smart-red">
            permanently discarded
          </span>
          .
        </p>
        <p className="text-center text-white/70 text-xs mt-2">
          Only completed matches count toward your profile statistics.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/20"
        >
          Continue Playing
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-lg border border-smart-red bg-smart-red px-6 py-3 text-base font-semibold text-white transition hover:bg-smart-red/80"
        >
          Quit Anyway
        </button>
      </div>
    </div>
  );
}
