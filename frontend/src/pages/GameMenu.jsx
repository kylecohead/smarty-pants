/**
 * Nina
 * PAGE: Game Menu (spec #4 "The game page")
 * Buttons:
 *  - Create Game -> /game/create
 *  - Join Game -> /game/join
 * Back: to Landing "/landing"
 */
import { Link, useNavigate } from "react-router-dom";

function Heading() {
  const letters = [
    { t: "S", c: "text-smart-green" },
    { t: "m", c: "text-smart-orange" },
    { t: "a", c: "text-smart-light-blue" },
    { t: "r", c: "text-smart-light-pink" },
    { t: "t", c: "text-smart-green" },
    { t: "i", c: "text-smart-red" },
    { t: "e", c: "text-smart-purple" },
    { t: " ", c: "" },
    { t: "P", c: "text-smart-light-blue" },
    { t: "a", c: "text-smart-yellow" },
    { t: "n", c: "text-smart-green" },
    { t: "t", c: "text-smart-pink" },
    { t: "s", c: "text-smart-light-pink" },
  ];
  return (
    <h1 className="text-center font-heading text-4xl sm:text-6xl font-black leading-none mb-8">
      {letters.map((l, i) => (
        <span key={i} className={l.c}>
          {String(l.t).toUpperCase()}
        </span>
      ))}
    </h1>
  );
}

export default function GameMenu() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-smart-dark-blue flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-smart-white font-button transition-colors"
        >
          ← Back
        </button>

        {/* Main content */}
        <div className="space-y-12">
          {/* Title */}
          <Heading />

          {/* Big buttons */}
          <div className="flex flex-col items-center gap-6">
            <Link
              to="/game/create"
              className="w-full max-w-md rounded-2xl bg-smart-red border-4 border-smart-white px-12 py-6 text-2xl font-bold text-smart-white font-button hover:opacity-80 transition-opacity shadow-2xl"
            >
              CREATE GAME
            </Link>
            <Link
              to="/game/join"
              className="w-full max-w-md rounded-2xl bg-smart-light-blue border-4 border-smart-white px-12 py-6 text-2xl font-bold text-smart-white font-button hover:opacity-80 transition-opacity shadow-2xl"
            >
              JOIN GAME
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
