import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundCreate from "../assets/background_create.jpg";
import { sendGameInvite } from "../utils/notifications.js";
import { authenticatedFetch } from "../utils/auth.js";

// "Smart" palette — tweak freely to match your design system
const colors = {
  darkBlue: "#0A2442", // smart-darkblue background
  ink: "#E8F1FF", // body copy on dark
  accentA: "#32D399", // section A
  accentB: "#6EC5FF", // section B
  accentC: "#FFC857", // section C
  muted: "#94A3B8", // helpers
};

// Import background images for game modes
import backGeneral from "../assets/backGeneral.jpg";
import backScience from "../assets/backScience.jpg";
import backHistory from "../assets/backHistory.jpg";
import backSports from "../assets/backSports.jpg";
import backCulture from "../assets/backCulture.jpg";

/**
 * Available game modes with their display labels and background images
 * Each mode represents a different trivia category
 * @type {Array<{key: string, label: string, backgroundImage: string}>}
 */
const MODES = [
  { key: "general", label: "General Knowledge", backgroundImage: backGeneral },
  { key: "science", label: "Science", backgroundImage: backScience },
  { key: "history", label: "History", backgroundImage: backHistory },
  { key: "sports", label: "Sports", backgroundImage: backSports },
  {
    key: "entertainment",
    label: "Entertainment",
    backgroundImage: backCulture,
  },
];

// Scoring is fixed server-side to a single time-based model

/**
 * Section title component with customizable color
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Title text content
 * @param {string} props.color - CSS color value for the title
 * @returns {JSX.Element} Styled section title
 */
function SectionTitle({ children, color }) {
  return (
    <h3 className="text-lg font-semibold tracking-wide mb-2" style={{ color }}>
      {children}
    </h3>
  );
}

/**
 * Animated heading component that displays "SMARTIE PANTS" with colorful letters
 * Each letter has its own color class for visual appeal
 * @returns {JSX.Element} Colorful animated heading
 */
function Heading() {
  // Array of letters with their corresponding color classes
  const letters = [
    { t: "S", c: "text-smart-green" },
    { t: "m", c: "text-smart-orange" },
    { t: "a", c: "text-smart-light-blue" },
    { t: "r", c: "text-smart-light-pink" },
    { t: "t", c: "text-smart-green" },
    { t: "i", c: "text-smart-red" },
    { t: "e", c: "text-smart-purple" },
    { t: " ", c: "" }, // Space character with no color
    { t: "P", c: "text-smart-light-blue" },
    { t: "a", c: "text-smart-yellow" },
    { t: "n", c: "text-smart-green" },
    { t: "t", c: "text-smart-pink" },
    { t: "s", c: "text-smart-dark-blue" },
  ];

  return (
    <h1
      className="text-center font-heading text-4xl sm:text-6xl font-black leading-none"
      style={{
        textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)",
      }}
    >
      {letters.map((l, i) => (
        <span key={i} className={l.c}>
          {String(l.t).toUpperCase()}
        </span>
      ))}
    </h1>
  );
}

/**
 * CreateGame Component - Allows users to create and configure a new trivia game
 * Handles game visibility (public/private), player invitations, mode selection,
 * and gameplay settings like timing and scoring
 * @returns {JSX.Element} The create game page
 */
export default function CreateGame() {
  // Game visibility state (public games are discoverable, private require invites)
  const [isPublic, setIsPublic] = useState(true);

  // Game configuration states
  const [title, setTitle] = useState(""); // Game title/name
  const [maxPlayers, setMaxPlayers] = useState(6); // Maximum number of players allowed
  const [usernameQuery, setUsernameQuery] = useState(""); // Search query for finding users to invite
  const [invited, setInvited] = useState([]); // Array of invited user objects {id, username}
  const [modeIndex, setModeIndex] = useState(0); // Currently selected game mode index
  const [username, setUsername] = useState(""); // Current user's username
  const [scheduleMode, setScheduleMode] = useState('now');
  const [delayMinutes, setDelayMinutes] = useState(5);

  const [secPerQ, setSecPerQ] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = Number(
        window.sessionStorage.getItem("questionDurationSeconds")
      );
      if (Number.isFinite(stored) && stored >= 5 && stored <= 60) {
        return stored;
      }
    }
    return 10;
  }); // Seconds per question timer

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("questionDurationSeconds", String(secPerQ));
    }
  }, [secPerQ]);
  const [numQuestions, setNumQuestions] = useState(5); // Number of questions per game (5-10)

  // Current selected game mode object
  const mode = MODES[modeIndex];
  const navigate = useNavigate();

  // State for user search
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  /**
   * Search for users by username
   * @param {string} query - Search query
   */
  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter out already invited users
        const filteredResults = data.users.filter(
          (user) => !invited.some((invitedUser) => invitedUser.id === user.id)
        );
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("❌ User search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(usernameQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [usernameQuery, invited]);

  /**
   * Copies the game invitation link to clipboard
   * In production, this would generate a unique game link
   */
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://game.smart/abcd1234");
      // TODO: Show success toast notification
    } catch {
      // Silently fail if clipboard API is not available
    }
  };

  /**
   * Adds a user to the invited players list if not already present
   * @param {Object} user - User object to invite {id, username}
   */
  const addInvite = (user) =>
    setInvited((xs) => (xs.some((x) => x.id === user.id) ? xs : [...xs, user]));

  /**
   * Removes a user from the invited players list
   * @param {number} userId - User ID to remove
   */
  const removeInvite = (userId) =>
    setInvited((xs) => xs.filter((x) => x.id !== userId));

  /**
   * Navigate to previous game mode in carousel
   * Uses modulo to wrap around to end when at beginning
   */
  const goPrev = () =>
    setModeIndex((i) => (i - 1 + MODES.length) % MODES.length);

  /**
   * Navigate to next game mode in carousel
   * Uses modulo to wrap around to beginning when at end
   */
  const goNext = () => setModeIndex((i) => (i + 1) % MODES.length);

  const API_URL = "/api/users";

  // Create match in database ==============================
  async function handleCreateGame() {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please log in first.");
        return;
      }

      // 🔹 Get current user info
      let currentUsername = "";
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) {
          currentUsername = data.user.username;
          setUsername(currentUsername);
        }
      } catch (err) {
        console.error("Fetch user failed:", err);
      }

      // 🔹 Create match
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title || "Untitled Match",
          category: mode.label,
          difficulty: "Easy",
          isPublic: isPublic,
          maxPlayers: maxPlayers,
          numQuestions: numQuestions,
          timeLimit: secPerQ, // seconds per question

          isScheduled: scheduleMode === 'schedule', // defines whether the match is scheduled or not
          scheduledDelayMinutes: scheduleMode === 'schedule' ? delayMinutes : undefined,
        }),
      });

      const match = await res.json();
      if (!res.ok) throw new Error(match.error || "Failed to create match!");

      console.log("✅ Created match:", match.id, match);

      // 🔹 Send invites to invited users if any
      if (invited.length > 0) {
        console.log(`📤 Sending invites to ${invited.length} user(s)...`);

        for (const user of invited) {
          try {
            const matchName = title || "Untitled Match";
            const message = `${currentUsername} invited you to join "${matchName}" (${mode.label})`;

            await sendGameInvite(user.id, match.id, message);
            console.log(`✅ Invite sent to ${user.username}`);
          } catch (inviteError) {
            console.error(
              `❌ Failed to send invite to ${user.username}:`,
              inviteError
            );
          }
        }
      }

      navigate(`/lobby/${match.id}`);
    } catch (err) {
      console.error("❌ Error creating match:", err);
      alert(err.message);
    }
  }
  //=============================================================

  return (
    <div
      className="min-h-screen bg-smart-dark-blue text-smart-white overflow-y-auto bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundCreate})`,
      }}
    >
      {/* Back to Game Menu */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-white transition-colors z-10"
      >
        ← Game Menu
      </button>

      {/* Main Content Panel */}
      <div className="px-4 py-10 flex items-center justify-center min-h-screen">
        <div className="bg-smart-light-pink/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 max-w-3xl w-full">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <Heading />
          </div>

          {/* Game Title Input */}
          <div className="flex items-center justify-center mt-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full max-w-md text-center rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 px-4 py-3 outline-none text-lg font-semibold placeholder:font-semibold placeholder:uppercase"
              placeholder="GAME NAME"
            />
          </div>

          {/* Visibility */}
          <div className="mt-6">
            <SectionTitle color="#1740d1ff">Visibility</SectionTitle>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className={`rounded-2xl px-6 py-3 text-sm font-bold border-2 transition-all ${
                  isPublic
                    ? "bg-smart-pink text-black border-smart-pink"
                    : "bg-transparent text-white border-white hover:bg-white/10"
                }`}
                onClick={() => setIsPublic(true)}
              >
                Public
              </button>
              <button
                className={`rounded-2xl px-6 py-3 text-sm font-bold border-2 transition-all ${
                  !isPublic
                    ? "bg-smart-yellow text-black border-smart-yellow"
                    : "bg-transparent text-white border-white hover:bg-white/10"
                }`}
                onClick={() => setIsPublic(false)}
              >
                Private
              </button>
            </div>

            {/* Public vs Private controls */}
            {isPublic ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 text-sm">
                    Max players
                  </label>
                  <div className="flex items-center gap-4 mt-1">
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                      className="w-full accent-white"
                    />
                    <span className="inline-block rounded-xl border border-white/20 bg-white/10 text-white text-xs px-2 py-1">
                      {maxPlayers}
                    </span>
                  </div>
                </div>
                {/** Schedule */}
                <div className="mt-6">
                  <SectionTitle color={colors.accentB}>Start Time</SectionTitle>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="scheduleMode"
                        value="now"
                        checked={scheduleMode === 'now'}
                        onChange={() => setScheduleMode('now')}
                      />
                      <span>Start now</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="scheduleMode"
                        value="schedule"
                        checked={scheduleMode === 'schedule'}
                        onChange={() => setScheduleMode('schedule')}
                      />
                      <span>Schedule start</span>
                    </label>
                  </div>

                  {scheduleMode === 'schedule' && (
                    <div className="mt-3">
                      <label className="block text-white/90 text-sm">
                        Starts in (minutes)
                      </label>
                      <div className="flex items-center gap-4 mt-1">
                        <input
                          type="range"
                          min={1}
                          max={60}
                          step={1}
                          value={delayMinutes}
                          onChange={(e) => setDelayMinutes(parseInt(e.target.value, 10))}
                          className="w-full accent-white"
                        />
                        <span className="inline-block rounded-xl border border-white/20 bg-white/10 text-white text-xs px-2 py-1">
                          {delayMinutes} min
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyLink}
                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-sm"
                  >
                    ⧉ Copy game link
                  </button>
                  <div className="relative grow sm:grow-0">
                    <input
                      value={usernameQuery}
                      onChange={(e) => setUsernameQuery(e.target.value)}
                      placeholder="Search username"
                      className="pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 w-full sm:w-64 outline-none"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60">
                      {searchLoading ? "⟳" : "🔎"}
                    </span>
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-[#0f2b53] shadow-lg">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              addInvite(user);
                              setUsernameQuery("");
                              setSearchResults([]);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-white/10 text-white text-sm"
                          >
                            @{user.username}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stacked invited avatars */}
                <div className="mt-4">
                  <label className="block text-white/90 text-sm">Players</label>
                  <div className="flex items-center gap-2 mt-2">
                    {invited.length === 0 && (
                      <p className="text-sm text-white/60">
                        Invite users by username or send the link.
                      </p>
                    )}
                    <div className="flex -space-x-3">
                      {invited.map((user) => {
                        const initials = user.username
                          .slice(0, 2)
                          .toUpperCase();
                        return (
                          <div key={user.id} className="relative">
                            <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-xs ring-2 ring-[#0A2442] shadow">
                              {initials}
                            </div>
                            <button
                              onClick={() => removeInvite(user.id)}
                              className="absolute -top-1 -right-1 text-xs bg-white/20 hover:bg-white/30 rounded-full px-1"
                              aria-label={`Remove ${user.username}`}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game Mode carousel */}
          <div className="mt-8">
            <SectionTitle color="#FF1493">Choose Game Mode</SectionTitle>
            <div className="relative mt-3 rounded-2xl border-2 border-white bg-white/5 p-6 h-32">
              {/* Background image for current mode */}
              <div
                className="absolute inset-0 rounded-2xl bg-cover bg-center opacity-20"
                style={{
                  backgroundImage: mode.backgroundImage
                    ? `url(${mode.backgroundImage})`
                    : "none",
                }}
              />

              <div className="relative z-10 flex items-center justify-between h-full">
                <button
                  onClick={goPrev}
                  className="rounded-lg bg-white/10 hover:bg-white/20 text-white w-12 h-12 flex items-center justify-center font-bold text-lg"
                  aria-label="Previous mode"
                >
                  ←
                </button>
                <div className="text-center px-4 flex-1">
                  <p className="text-sm text-white/60 mb-1">Mode</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">
                    {mode.label}
                  </p>
                </div>
                <button
                  onClick={goNext}
                  className="rounded-lg bg-white/10 hover:bg-white/20 text-white w-12 h-12 flex items-center justify-center font-bold text-lg"
                  aria-label="Next mode"
                >
                  →
                </button>
              </div>

              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex justify-center gap-1">
                {MODES.map((m, i) => (
                  <span
                    key={m.key}
                    className={`h-2 w-8 rounded-full ${
                      i === modeIndex ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div className="mt-8">
            <SectionTitle color={colors.accentC}>
              Game Play Settings
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 text-sm">
                  Per-question timer
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={secPerQ}
                    onChange={(e) => setSecPerQ(parseInt(e.target.value, 10))}
                    className="w-full accent-white"
                  />
                  <span className="inline-block rounded-xl border border-white/20 bg-white/10 text-white text-xs px-2 py-1">
                    {secPerQ}s
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm">
                  Number of questions per round
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <input
                    type="range"
                    min={3}
                    max={7}
                    step={1}
                    value={numQuestions}
                    onChange={(e) =>
                      setNumQuestions(parseInt(e.target.value, 10))
                    }
                    className="w-full accent-white"
                  />
                  <span className="inline-block rounded-xl border border-white/20 bg-white/10 text-white text-xs px-2 py-1">
                    {numQuestions}
                  </span>
                </div>
              </div>

              {/* Scoring is fixed server-side to a single time-based model */}
            </div>
          </div>

          {/* Send Invite */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCreateGame} //Create game button
              className="rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg bg-smart-red hover:opacity-80 text-smart-white font-button transition-opacity"
            >
              Create Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
