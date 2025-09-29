import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Navigation helper
const DETAILS_ROUTE = "/game/join";
function goToDetails(id) {
  window.location.href = `${DETAILS_ROUTE}?matchId=${encodeURIComponent(id)}`;
}

/**
 * Brand heading component displaying "SMARTIE PANTS" with individual letter colors
 * Creates a vibrant, playful brand identity matching the main app design
 * @returns {JSX.Element} Multi-colored brand heading
 */
function Heading() {
  // Each letter mapped to its corresponding brand color class
  const letters = [
    { t: "S", c: "text-smart-green" },
    { t: "m", c: "text-smart-orange" },
    { t: "a", c: "text-smart-light-blue" },
    { t: "r", c: "text-smart-light-pink" },
    { t: "t", c: "text-smart-green" },
    { t: "i", c: "text-smart-red" },
    { t: "e", c: "text-smart-purple" },
    { t: " ", c: "" }, // Space with no styling
    { t: "P", c: "text-smart-light-blue" },
    { t: "a", c: "text-smart-yellow" },
    { t: "n", c: "text-smart-green" },
    { t: "t", c: "text-smart-pink" },
    { t: "s", c: "text-smart-dark-blue" },
  ];

  return (
    <h1 className="text-center font-heading text-4xl sm:text-5xl font-black leading-none mb-2">
      {letters.map((l, i) => (
        <span key={i} className={l.c}>
          {String(l.t).toUpperCase()}
        </span>
      ))}
    </h1>
  );
}

// Design system colors
const colors = {
  darkBlue: "#0A2442", // smart-darkblue background
  ink: "#E8F1FF", // body copy on dark
  accentA: "#32D399", // section A
  accentB: "#6EC5FF", // section B
  accentC: "#FFC857", // section C
  muted: "#94A3B8", // helpers
};

// Mock data
const mockInvitations = [
  {
    invitationId: "inv_123",
    matchId: "match_456",
    title: "Friday Night Trivia",
    hostName: "sarah_quiz",
    startTimeISO: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // +1 hour
    categories: ["Science", "History"],
    players: 4,
    maxPlayers: 8,
  },
];

const mockPublicGames = [
  {
    matchId: "match_789",
    title: "Quick Quiz Lobby",
    hostName: "alex_host",
    startsAtISO: null, // Instant
    categories: ["General", "Sports"],
    players: 3,
    maxPlayers: 6,
    difficulty: "Easy",
  },
  {
    matchId: "match_101",
    title: "Science Champions",
    hostName: "dr_quiz",
    startsAtISO: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // +15 minutes
    categories: ["Science", "Technology"],
    players: 2,
    maxPlayers: 4,
    difficulty: "Hard",
  },
  {
    matchId: "match_102",
    title: "Movie Night Quiz",
    hostName: "film_buff",
    startsAtISO: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
    categories: ["Movies", "Entertainment"],
    players: 1,
    maxPlayers: 8,
    difficulty: "Medium",
  },
];

export default function JoinGameLobby() {
  const [joinInput, setJoinInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startsFilter, setStartsFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  // Extract join code from URL or validate direct code
  const extractJoinCode = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Try to extract from URL
    const urlMatch = trimmed.match(/(?:join\/)?([A-Z0-9]{4}-?[A-Z0-9]{4})/i);
    if (urlMatch) {
      const code = urlMatch[1].toUpperCase();
      return code.includes("-") ? code : `${code.slice(0, 4)}-${code.slice(4)}`;
    }

    // Validate direct code
    const codeMatch = trimmed.match(/^[A-Z0-9]{4}-?[A-Z0-9]{4}$/i);
    if (codeMatch) {
      const code = trimmed.toUpperCase();
      return code.includes("-") ? code : `${code.slice(0, 4)}-${code.slice(4)}`;
    }

    return null;
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const code = extractJoinCode(joinInput);
    if (!code) {
      setInputError("That doesn't look like a valid link or code.");
      return;
    }
    setInputError("");
    // Future API call: POST /api/join { joinCode: code }
    goToDetails("demo_match_id");
  };

  const handleInputChange = (e) => {
    setJoinInput(e.target.value);
    if (inputError) setInputError("");
  };

  // Filter public games
  const filteredGames = useMemo(() => {
    return mockPublicGames.filter((game) => {
      const matchesSearch =
        !searchQuery ||
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.hostName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !categoryFilter ||
        game.categories.some((cat) =>
          cat.toLowerCase().includes(categoryFilter.toLowerCase())
        );

      const matchesDifficulty =
        !difficultyFilter || game.difficulty === difficultyFilter;

      const matchesStarts =
        !startsFilter ||
        (() => {
          const now = Date.now();
          switch (startsFilter) {
            case "Now":
              return !game.startsAtISO;
            case "<15m":
              return (
                !game.startsAtISO ||
                new Date(game.startsAtISO).getTime() - now < 15 * 60 * 1000
              );
            case "Today":
              return (
                !game.startsAtISO ||
                new Date(game.startsAtISO).toDateString() ===
                  new Date().toDateString()
              );
            default:
              return true;
          }
        })();

      return (
        matchesSearch && matchesCategory && matchesDifficulty && matchesStarts
      );
    });
  }, [searchQuery, categoryFilter, startsFilter, difficultyFilter]);

  const formatStartTime = (isoString) => {
    if (!isoString) return "Starting now";
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 60) return `Starts in ${diffMinutes}m`;
    if (diffMinutes < 1440)
      return `Starts in ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`;
    return date.toLocaleDateString();
  };

  const navigate = useNavigate(); // Hook for programmatic navigation

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.darkBlue }}>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Back navigation button - returns to previous page */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-white transition-colors"
        >
          ← Back
        </button>

        {/* Header with colorful SMARTIE PANTS branding */}
        <div className="text-center mb-8">
          <Heading />
          <h2 className="text-smart-orange font-heading text-2xl font-bold tracking-wider">
            ~JOIN A GAME~
          </h2>
        </div>

        {/* Join by Code/URL Section - Smart Orange Theme */}
        <div className="rounded-3xl border border-orange-400/30 bg-orange-500/10 shadow-xl backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-smart-orange mb-6 text-center">
            Join with Code or Link
          </h2>
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="joinInput"
                className="block text-lg font-semibold text-smart-orange mb-3"
              >
                Enter Join Code or Paste Link
              </label>
              <input
                id="joinInput"
                type="text"
                value={joinInput}
                onChange={handleInputChange}
                placeholder="ABCD-1234"
                className="w-full rounded-xl bg-orange-500/20 border-2 border-orange-400/40 text-white placeholder:text-orange-200/70 px-6 py-4 text-lg outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                aria-describedby="joinInputHelp joinInputError"
              />
              <p id="joinInputHelp" className="text-sm text-orange-200/80 mt-2">
                Paste link or enter code (e.g., ABCD-1234 or
                https://…/join/ABCD-1234)
              </p>
              {inputError && (
                <p
                  id="joinInputError"
                  className="text-sm text-red-400 mt-2 font-medium"
                  aria-live="polite"
                >
                  {inputError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl px-6 py-4 bg-smart-orange text-white text-lg font-bold hover:opacity-90 transition shadow-lg"
            >
              Join Game
            </button>
          </form>
        </div>

        {/* Your Invitations Section - Light Blue Theme */}
        <div className="rounded-3xl border border-blue-400/30 bg-blue-500/10 shadow-xl backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-smart-light-blue mb-6 text-center">
            Your Invitations
          </h2>
          {mockInvitations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-blue-200/80 text-lg mb-2">
                No invitations yet.
              </p>
              <p className="text-blue-200/60 text-sm">
                Check back later for game invites!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Future API call: GET /api/invitations?status=pending */}
              {mockInvitations.map((invite) => (
                <div
                  key={invite.invitationId}
                  className="rounded-xl border-2 border-blue-400/30 bg-blue-500/20 p-6 hover:border-blue-400/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-smart-light-blue text-lg mb-2">
                        {invite.title}
                      </h3>
                      <p className="text-base text-blue-200/80 mb-1">
                        Host:{" "}
                        <span className="font-semibold">
                          @{invite.hostName}
                        </span>
                      </p>
                      <p className="text-sm text-blue-200/70 mb-1">
                        {formatStartTime(invite.startTimeISO)} •{" "}
                        {invite.categories.join(", ")}
                      </p>
                      <p className="text-sm text-blue-200/60">
                        {invite.players}/{invite.maxPlayers} players
                      </p>
                    </div>
                    <div className="flex gap-3 ml-6">
                      <button
                        onClick={() => goToDetails(invite.matchId)}
                        className="rounded-xl px-5 py-3 bg-smart-green text-white text-base font-bold hover:opacity-90 transition shadow-lg"
                        aria-label={`Accept invitation to ${invite.title}`}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          /* Future API call: POST /api/invitations/${invite.invitationId}/decline */
                        }}
                        className="rounded-xl px-5 py-3 border-2 border-blue-400/40 text-blue-200 text-base font-medium hover:bg-blue-500/30 transition"
                        aria-label={`Decline invitation to ${invite.title}`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Public Games Section - Pink Theme */}
        <div className="rounded-3xl border border-pink-400/30 bg-pink-500/10 shadow-xl backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-smart-pink mb-6 text-center">
            Public Games
          </h2>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl bg-pink-500/20 border-2 border-pink-400/40 text-white placeholder:text-pink-200/70 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              aria-label="Search public games"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl bg-pink-500/20 border-2 border-pink-400/40 text-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-pink-400"
              aria-label="Filter by category"
            >
              <option value="" className="bg-gray-800">
                All Categories
              </option>
              <option value="General" className="bg-gray-800">
                General
              </option>
              <option value="Science" className="bg-gray-800">
                Science
              </option>
              <option value="Sports" className="bg-gray-800">
                Sports
              </option>
              <option value="Movies" className="bg-gray-800">
                Movies
              </option>
            </select>
            <select
              value={startsFilter}
              onChange={(e) => setStartsFilter(e.target.value)}
              className="rounded-xl bg-pink-500/20 border-2 border-pink-400/40 text-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-pink-400"
              aria-label="Filter by start time"
            >
              <option value="" className="bg-gray-800">
                Starts: Anytime
              </option>
              <option value="Now" className="bg-gray-800">
                Now
              </option>
              <option value="<15m" className="bg-gray-800">
                &lt;15 minutes
              </option>
              <option value="Today" className="bg-gray-800">
                Today
              </option>
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="rounded-xl bg-pink-500/20 border-2 border-pink-400/40 text-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-pink-400"
              aria-label="Filter by difficulty"
            >
              <option value="" className="bg-gray-800">
                All Difficulties
              </option>
              <option value="Easy" className="bg-gray-800">
                Easy
              </option>
              <option value="Medium" className="bg-gray-800">
                Medium
              </option>
              <option value="Hard" className="bg-gray-800">
                Hard
              </option>
            </select>
          </div>

          {filteredGames.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-pink-200/80 text-lg mb-2">
                No public games right now.
              </p>
              <p className="text-pink-200/60 text-sm">
                Try adjusting your filters or check back later!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Future API call: GET /api/matches/public?search=&category=&startsBefore=&sort= */}
              {filteredGames.map((game) => (
                <div
                  key={game.matchId}
                  className="rounded-xl border-2 border-pink-400/30 bg-pink-500/20 p-6 hover:border-pink-400/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-smart-pink text-lg">
                          {game.title}
                        </h3>
                        {!game.startsAtISO && (
                          <span className="px-3 py-1 bg-smart-green text-white text-sm font-semibold rounded-full">
                            Instant
                          </span>
                        )}
                        <span className="px-3 py-1 bg-pink-500/40 text-pink-200 text-sm font-medium rounded-full">
                          {game.difficulty}
                        </span>
                      </div>
                      <p className="text-base text-pink-200/80 mb-1">
                        Host:{" "}
                        <span className="font-semibold">@{game.hostName}</span>
                      </p>
                      <p className="text-sm text-pink-200/70 mb-1">
                        {formatStartTime(game.startsAtISO)} •{" "}
                        {game.categories.join(", ")}
                      </p>
                      <p className="text-sm text-pink-200/60">
                        {game.players}/{game.maxPlayers} players
                      </p>
                    </div>
                    <div className="flex gap-3 ml-6">
                      <button
                        onClick={() => goToDetails(game.matchId)}
                        className="rounded-xl px-5 py-3 border-2 border-pink-400/40 text-pink-200 text-base font-medium hover:bg-pink-500/30 transition"
                        aria-label={`Preview ${game.title}`}
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => goToDetails(game.matchId)}
                        className="rounded-xl px-5 py-3 bg-smart-pink text-white text-base font-bold hover:opacity-90 transition shadow-lg"
                        aria-label={`Join ${game.title}`}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 
        Future API calls and error handling:
        
        // Get pending invitations
        const fetchInvitations = async () => {
          try {
            const response = await fetch('/api/invitations?status=pending');
            const invitations = await response.json();
            setInvitations(invitations);
          } catch (error) {
            // Handle NOT_AUTHENTICATED, network errors
          }
        };

        // Get public games with filters
        const fetchPublicGames = async () => {
          const params = new URLSearchParams({
            search: searchQuery,
            category: categoryFilter,
            startsBefore: startsFilter === '<15m' ? new Date(Date.now() + 15*60*1000).toISOString() : '',
            sort: 'startTime'
          });
          
          try {
            const response = await fetch(`/api/matches/public?${params}`);
            const games = await response.json();
            setPublicGames(games);
          } catch (error) {
            // Handle errors
          }
        };

        // Join game by code
        const joinGameByCode = async (joinCode) => {
          try {
            const response = await fetch('/api/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ joinCode })
            });
            
            if (response.ok) {
              const { matchId } = await response.json();
              goToDetails(matchId);
            } else {
              const error = await response.json();
              switch (error.code) {
                case 'MATCH_FULL': setInputError('This game is full.'); break;
                case 'MATCH_CLOSED': setInputError('This game is no longer accepting players.'); break;
                case 'NOT_AUTHENTICATED': setInputError('Please log in to join games.'); break;
                default: setInputError('Unable to join game. Please try again.'); break;
              }
            }
          } catch (error) {
            setInputError('Network error. Please try again.');
          }
        };

        // Accept/decline invitations
        const handleInvitation = async (invitationId, action) => {
          try {
            const response = await fetch(`/api/invitations/${invitationId}/${action}`, {
              method: 'POST'
            });
            
            if (response.ok) {
              if (action === 'accept') {
                const { matchId } = await response.json();
                goToDetails(matchId);
              } else {
                // Remove from invitations list
                setInvitations(prev => prev.filter(inv => inv.invitationId !== invitationId));
              }
            }
          } catch (error) {
            // Handle errors
          }
        };
        */}
      </div>
    </div>
  );
}
