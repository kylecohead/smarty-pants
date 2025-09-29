/**
 * AMY
 * PAGE: Game Lobby (spec #6)
 * Buttons:
 *  - Play Game -> /game/play
 *  - Show Round Number -> /lobby/round (modal)
 * Back: to previous (Create/Join)
 */
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";


export default function Lobby() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState(Array(6).fill(null));

  // Simulate players joining every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(current => {
        const firstEmpty = current.findIndex(p => p === null);
        if (firstEmpty === -1) return current; // all slots filled

        const newPlayers = [...current];
        newPlayers[firstEmpty] = {
          id: firstEmpty,
          image: `https://api.dicebear.com/7.x/avatars/svg?seed=player${firstEmpty}` // placeholder avatar
        };
        return newPlayers;
      });
    }, 2000);
  
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 rounded-lg border px-4 py-2 hover:bg-slate-100"
      >
        ← Back
      </button>

      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Game Lobby</h1>

        {/* Player squares grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {players.map((player, index) => (
            <div
              key={index}
              className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center"
            >
              {player ? (
                <img
                  src={player.image}
                  alt={`Player ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <span className="text-gray-400">Empty</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            to="/game/play"
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Play Game
          </Link>
          <Link
            to="/lobby/round"
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Show Round Number
          </Link>
        </div>
      </div>

      {/* round modal outlet */}
      <Outlet />
    </div>
  );
}
