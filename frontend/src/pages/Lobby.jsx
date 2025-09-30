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
  const [isLobbyFull, setIsLobbyFull] = useState(false); // To track if lobby is full

  // Simulate players joining every 2 seconds
  useEffect(() => {
    let playerCount = 0;
    const interval = setInterval(() => {
      if (playerCount >= 6) {
        clearInterval(interval);
        setIsLobbyFull(true);
        return; // Stop adding players when full
      }

      setPlayers(current => {
        const newPlayers = [...current];        
        newPlayers[firstEmpty] = {
          id: playerCount,
          username: `Player ${playerCount + 1}`,
          image: `https://api.dicebear.com/7.x/avatars/svg?seed=player${playerCount}`, // placeholder avatar
          joinedAt: new Date().toISOString()
        };
        return newPlayers;
      });
      playerCount++;
    }, 2000);
  
    return () => clearInterval(interval);
  }, []);

  // Player square component
  const PlayerSquare = ({ player, index }) => (
    <div
      className={`w-24 h-24 border-2 ${
        player ? 'border-green-500' : 'border-gray-300'
      } rounded-lg flex flex-col items-center justify-center transition-all duration-300`}
    >
      {player ? (
        <>
          <img
            src={player.image}
            alt = {player.username}
            className="w-16 h-16 object-cover rounded-full"
          />
          <span className="text-cs mt-1 test-gray-600">{player.username}</span>
        </>
      ) : (
        <span className="text-gray-400">Waiting...</span>
      )}
    </div>
  );

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

        {/* Player count display */}
        <div className="test-sm text-gray-600">
          Players: {players.filter(p => p !== null).length} / 6
        </div>

        {/* Player squares grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {players.map((player, index) => (
            <PlayerSquare key={index} player={player} index={index}/>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            to="/game/play"
            className={`rounded-xl border px-6 py-3 ${
              isLobbyFull 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            onClick={(e) => !isLobbyFull && e.preventDefault()}
          >
            {isLobbyFull ? 'Play Game' : 'Waiting for Players...'}
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
