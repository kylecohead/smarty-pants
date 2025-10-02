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
import catImage from '../assets/cat.jpg'; 

const colors = {
  darkBlue: "#0A2442", // smart-darkblue background
  ink: "#E8F1FF", // body copy on dark
  accentA: "#32D399", // section A
  accentB: "#6EC5FF", // section B
  accentC: "#FFC857", // section C
  muted: "#94A3B8", // helpers
};

function SectionTitle( { children, color }) {
  return (
    <h3 className="text-lg font-semibold tracking-wide mb-2" style={{ color }}>
      {children}
    </h3>
  );
}

function Heading() {
  const letters = [
    { t: "G", c: "text-smart-green" },
    { t: "a", c: "text-smart-orange" },
    { t: "m", c: "text-smart-light-blue" },
    { t: "e", c: "text-smart-light-pink" },
    { t: " ", c: "" },
    { t: "L", c: "text-smart-red" },
    { t: "o", c: "text-smart-purple" },
    { t: "b", c: "text-smart-light-blue" },
    { t: "b", c: "text-smart-yellow" },
    { t: "y", c: "text-smart-green" },
  ];

  return (
    <h1 className="text-center font-heading text-6xl sm:text-7xl font-black leading-none tracking-wider mb-8">
      {letters.map((letter, index) => (
        <span key={index} className={letter.c}>
          {String(letter.t).toUpperCase()}
        </span>
      ))}
    </h1>
  );
}

// Helper function for ... loading dots
const useLoadingDots = () => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return '.'.repeat(dots);
};

export default function Lobby() {
  const navigate = useNavigate();
  // Initialize players with the host at index 0
  const [players, setPlayers] = useState(() => {
    const initialPlayers = Array(6).fill(null);
    initialPlayers[0] = {
      id: 0,
      username: 'Host Player',
      image: catImage,
      joinedAt: new Date().toISOString()
    };
    return initialPlayers;
  });
  const [isLobbyFull, setIsLobbyFull] = useState(false); // To track if lobby is full
  const loadingDots = useLoadingDots();

  // Simulate players joining every 2 seconds
  useEffect(() => {
    let currentIndex = 0; // Start at 1 since host is at 0

    const interval = setInterval(() => {
      if (currentIndex >= 5) {
        setIsLobbyFull(true);
        clearInterval(interval);
        return;
      }

      setPlayers(current => {
        const newPlayers = [...current];
        // Skip index 0 since host is there
        newPlayers[currentIndex] = {
          id: currentIndex,
          username: `Player ${currentIndex + 1}`,
          image: catImage,
          joinedAt: new Date().toISOString()
        };
        return newPlayers;
      });

      currentIndex++;
    }, 2000);

    return () => clearInterval(interval);
  }, []);


  // Player square component
  const PlayerSquare = ({ player, index }) => (
    <div
      className={`w-32 h-32 border-2 rounded-xl ${
        player 
          ? 'border-emerald-500 bg-white/10' 
          : 'border-white/20 bg-white/5'
      } flex flex-col items-center justify-center transition-all duration-300`}
    >
      {player ? (
        <>
          <img
            src={player.image}
            alt = {player.username}
            className="w-24 h-24 object-cover rounded-full ring-2 ring-white/20"
          />
          <span className="text-sm mt-2 text-white/80">{player.username}</span>
        </>
      ) : (
        <span className="text-white/50">Waiting...</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style = {{ backgroundColor: colors.darkBlue }}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-white font-button transition-colors"
        >
          ← Back
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-8 sm:p-12">
          {/* Header with colorful letters */}
          <div className="flex items-center justify-center">
            <Heading />
          </div>

          {/*Player count display*/}
          <div className="mt-4 text-center">
            <SectionTitle color={colors.accentA}>
              Players: {players.filter(p => p !== null).length} / 6
            </SectionTitle>
          </div>

          {/* Player squares grid */}
          <div className="mt-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {players.map((player, index) => (
                <PlayerSquare key={index} player={player} index={index}/>
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          {!isLobbyFull && (
            <div className="text-white/60 text-center mt-4">
              Waiting for players{loadingDots}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/game/play"
              className={`rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg transition-opacity ${
                isLobbyFull 
                  ? 'bg-smart-red hover:opacity-80 text-white' 
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
              onClick={(e) => !isLobbyFull && e.preventDefault()}
            >
              Play Game
            </Link>
            <Link
              to="/lobby/round"
              className="rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Show Round Number
            </Link>
          </div>
        </div>

        {/* Helper text */}
        <p className="mt-4 text-center text-xs" style={{ color: colors.muted }}>
          Note: The "Play Game" button is enabled when the lobby is full (6 players).
        </p>
      </div>

    {/* round modal outlet */}
      <Outlet />
    </div>
  );
}
