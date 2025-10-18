/**
 * PlayGame Page (Real Multiplayer via Socket.IO)
 * ----------------------------------------------
 * Combines real-time multiplayer logic with simulated game's visuals.
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSocket } from "../services/socket";
import { api } from "../services/api";
import backgroundGamePlay from "../assets/background_gamePlay.jpg";
import backgroundWaitHost from "../assets/background_waitHost.jpg";
import GameHeader from "../components/GameHeader";
import QuestionCard from "../components/QuestionCard";
import GameOverScreen from "../components/GameOverScreen";
import QuestionRecapModal from "../modals/QuestionRecapModal";
import GameOverModal from "../modals/GameOverModal";
import QuitConfirmModal from "../modals/QuitConfirmModal";

const colors = { darkBlue: "#0A2442" };

export default function PlayGame() {
  const navigate = useNavigate();
  const { matchId } = useParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [question, setQuestion] = useState(null);
  const [scores, setScores] = useState({});
  const [matchEnded, setMatchEnded] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [recapData, setRecapData] = useState(null);
  const [showRecap, setShowRecap] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [finalRanking, setFinalRanking] = useState([]);
  const [isTie, setIsTie] = useState(false);
  const [tiedPlayers, setTiedPlayers] = useState([]);

  // 🆕 Round tracking
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  const [showRoundSummary, setShowRoundSummary] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const timeoutGuardRef = useRef(null);
  const questionStartTimeRef = useRef(0);
  const timeLeftRef = useRef(0);
  const isAnsweredRef = useRef(isAnswered);
  useEffect(() => {
    isAnsweredRef.current = isAnswered;
  }, [isAnswered]);

  // Fetch current user with token refresh fallback
  const fetchCurrentUser = async () => {
    try {
      const data = await api.getCurrentUser();
      setCurrentUser(data.user);
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);

      if (err.message.includes("Invalid token") || err.message.includes("Unauthorized")) {
        console.log("🔄 Token expired, attempting refresh...");
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            await api.refreshAccessToken();
            const data = await api.getCurrentUser();
            setCurrentUser(data.user);
          } catch (refreshErr) {
            console.error("❌ Token refresh failed:", refreshErr);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            navigate("/login");
          }
        } else {
          console.log("❌ No refresh token available");
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      }
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Listen for user data refresh (e.g., from settings)
  useEffect(() => {
    const handleUserRefresh = () => {
      console.log("🔄 Refreshing user data in game after settings update...");
      fetchCurrentUser();
    };
    window.addEventListener("refreshUserData", handleUserRefresh);
    return () => window.removeEventListener("refreshUserData", handleUserRefresh);
  }, []);

  // Socket setup
  useEffect(() => {
    if (!currentUser || !matchId) return;
    const token = localStorage.getItem("accessToken");
    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinMatch", { matchId, token });
      setTimeout(() => socket.emit("requestCurrentQuestion", { matchId }), 500);
    });

    // Handle new question
    socket.on("newQuestion", (data) => {
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);
      setQuestion(data);
      // Update round info if provided
      if (data.round) setCurrentRound(data.round);
      if (data.totalRounds) setTotalRounds(data.totalRounds);
      setCurrentCorrectAnswer(null);
      setIsAnswered(false);
      setShowRecap(false);
      setRecapData(null);
      setShowRoundSummary(false); // hide if it was showing
      timeoutGuardRef.current = setTimeout(() => startTimer(data.timeLimit || 10000), 200);
    });

    // Handle answer confirmation
    socket.on("answerSubmitted", ({ correct, points }) => {
      if (!isAnswered) {
        setIsAnswered(true);
        clearTimeout(timeoutGuardRef.current);
        console.log(`🧠 Answer submitted: ${correct ? "✅ Correct" : "❌ Wrong"} (+${points})`);
      }
    });

    // Handle question results
    socket.on("questionResults", ({ responses, scores, correctAnswer }) => {
      setScores(scores);
      setCurrentCorrectAnswer(correctAnswer || null);
      const yourResponse = responses.find((r) => r.username === currentUser.username);

      const currentLeaderboard = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([playerName, totalScore], index) => {
          const playerResponse = responses.find((r) => r.username === playerName);
          return {
            id: index,
            name: playerName,
            total: totalScore,
            round: playerResponse ? playerResponse.points : 0,
            answered: playerResponse?.answered || false,
            correct: playerResponse?.correct || false,
            isYou: playerName === currentUser.username,
          };
        });

      const recapDataToShow = {
        correct: yourResponse?.correct || false,
        points: yourResponse?.points || 0,
        leaderboard: currentLeaderboard,
        correctAnswer: correctAnswer || null,
      };

      const timeRemaining = timeLeftRef.current;
      const show = () => {
        setRecapData(recapDataToShow);
        setShowRecap(true);
        setTimeLeft(0);
        clearInterval(timerRef.current);
        clearTimeout(timeoutGuardRef.current);
        setTimeout(() => setShowRecap(false), 4000);
      };
      if (timeRemaining > 100) setTimeout(show, timeRemaining);
      else show();
    });

    // Handle match started - get initial round info
    socket.on("matchStarted", ({ totalRounds, questionsPerRound }) => {
      console.log(`🎮 Match started with ${totalRounds} rounds, ${questionsPerRound} questions per round`);
      setTotalRounds(totalRounds);
    });

    // 🆕 Handle round summary
    socket.on("roundSummary", ({ round, totalRounds, scores }) => {
      console.log(`🏁 Round ${round} of ${totalRounds} finished`);
      setCurrentRound(round);
      setTotalRounds(totalRounds);
      setScores(scores || {});
      setShowRoundSummary(true);
      setTimeout(() => setShowRoundSummary(false), 7000);
    });

    // Handle player updates
    socket.on("playersUpdate", ({ players }) => {
      const map = {};
      players.forEach((p) => (map[p.username] = p.score));
      setScores(map);
    });

    // Handle match end
    socket.on("matchEnded", async (data) => {
      const { scores, ranking, tiebreakStats, isTie, tiedPlayers } = data;
      setScores(scores);
      setFinalRanking(ranking || tiebreakStats || []);
      setIsTie(!!isTie);
      setTiedPlayers(tiedPlayers || []);
      setMatchEnded(true);
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);

      try {
        if (currentUser) {
          const userScore = scores[currentUser.username];
          await api.incrementGamesPlayed(currentUser.id);
          if (!isTie && ranking?.[0]?.username === currentUser.username) {
            await api.incrementUserWins(currentUser.id);
          }
          await api.updateHighScore(currentUser.id, userScore);
        }
      } catch (error) {
        console.error("Failed to update user stats:", error);
      }
    });

    // Handle host leaving
    socket.on("hostLeft", ({ message, scores }) => {
      console.log("👑 Host left:", message);
      setScores(scores || {});
      setMatchEnded(true);
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);
      alert(message);
    });

    // Admin forcibly ends match
    socket.on("adminEnded", ({ message }) => {
      alert(message || "An administrator has ended this match.");
      setMatchEnded(true);
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);
      socket.disconnect();
      navigate("/landing");
    });

    // Admin kicks this player
    socket.on("kickedByAdmin", ({ message }) => {
      alert(message || "You were removed from the match by an administrator.");
      setMatchEnded(true);
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);
      socket.disconnect();
      navigate("/landing");
    });

    socket.connect();

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);
      if (socket.connected) socket.emit("leaveMatch", { matchId });
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [currentUser, matchId]);

  // Timer logic
  const startTimer = (duration) => {
    clearInterval(timerRef.current);
    const start = Date.now();
    questionStartTimeRef.current = start;
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - questionStartTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      timeLeftRef.current = remaining;
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (!isAnsweredRef.current) handleAnswer(null);
      }
    }, 100);
  };

  // Answer handling
  const handleAnswer = (optionLabel) => {
    if (isAnswered || !socketRef.current || !question) return;
    setIsAnswered(true);
    setSelectedAnswer(optionLabel);
    clearTimeout(timeoutGuardRef.current);
    const elapsedTimeMs = Date.now() - questionStartTimeRef.current;
    socketRef.current.emit("submitAnswer", {
      matchId,
      answer: optionLabel || "",
      elapsedTimeMs,
    });
  };

  // Quit confirmation
  const handleQuitGame = () => setShowQuitConfirm(true);
  const confirmQuitGame = () => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("leaveMatch", { matchId });
      socket.disconnect();
    }
    navigate("/landing");
  };
  const cancelQuit = () => setShowQuitConfirm(false);

  // ================== UI RENDERING ==================
  if (matchEnded) {
    const formattedLeaderboard = finalRanking.length
      ? finalRanking.map((p, index) => ({
          id: index,
          name: p.username,
          total: p.score,
          correct: p.correctCount,
          avgTime: p.avgTime,
          answers: p.totalAnswers,
          isYou: p.username === currentUser?.username,
        }))
      : Object.entries(scores).map(([username, score], index) => ({
          id: index,
          name: username,
          total: score,
          avgTime: null,
          isYou: username === currentUser?.username,
        }));

    const winner = formattedLeaderboard[0];

    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ backgroundColor: colors.darkBlue }}>
        <GameOverScreen
          winner={
            isTie
              ? { name: "🤝 It's a Tie!", score: winner?.total || 0, isYou: false }
              : { name: winner.name, score: winner.total, isYou: winner.name === currentUser?.username }
          }
          score={scores[currentUser?.username] || 0}
          finalLeaderboard={formattedLeaderboard}
        />
      </div>
    );
  }

  if (!question) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-y-auto bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundWaitHost})` }}
      >
        <div className="absolute inset-0 bg-black/30 animate-[pulse_3s_infinite]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-t-transparent border-[#6EC5FF] rounded-full animate-spin mb-8"></div>
          <h1 className="text-4xl font-heading font-black mb-4 tracking-wide drop-shadow-lg">
            WAITING FOR HOST...
          </h1>
          <p className="text-[#6EC5FF] text-xl font-heading animate-pulse drop-shadow-md">
            THE GAME WILL BEGIN SHORTLY
          </p>
        </div>
      </div>
    );
  }

  // ================== QUESTION DISPLAY ==================
  return (
    <div className="min-h-screen text-white relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundGamePlay})` }}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
        <GameHeader
          score={scores[currentUser?.username] || 0}
          currentQuestion={question.index}
          totalQuestions={question.total || 5}
          round={question.round || currentRound}
          totalRounds={totalRounds}
          onQuit={handleQuitGame}
        />

        <main className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
          <QuestionCard
            question={{
              text: question.q,
              options: question.options.map((opt) => ({ id: opt, label: opt })),
            }}
            timeLeftMs={timeLeft}
            questionDurationMs={question.timeLimit || 10000}
            youAnswered={isAnswered}
            selectedAnswer={selectedAnswer}
            questionResolved={showRecap}
            waitingOnOthers={isAnswered && !showRecap}
            onAnswer={(optionText) => handleAnswer(optionText)}
            correctAnswer={currentCorrectAnswer}
          />
        </main>
      </div>

      {/* 🆕 Round Summary Overlay */}
      {showRoundSummary && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 animate-pulse">🏁 ROUND {currentRound} COMPLETE!</h1>
            <p className="text-xl mb-2 text-smart-green">Round {currentRound} of {totalRounds}</p>
            {currentRound < totalRounds ? (
              <p className="text-2xl mb-6">Round {currentRound + 1} starts soon...</p>
            ) : (
              <p className="text-2xl mb-6 text-yellow-400">Final round complete! Game ending...</p>
            )}
            <div className="space-y-2 text-lg">
              {Object.entries(scores)
                .sort((a, b) => b[1] - a[1])
                .map(([player, score]) => (
                  <p key={player}>
                    <span className="font-bold">{player}</span>: {score} pts
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Recap */}
      {showRecap && recapData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <QuestionRecapModal
              correct={recapData.correct}
              points={recapData.points}
              leaderboard={recapData.leaderboard}
              questionIndex={question.index}
              onClose={() => setShowRecap(false)}
              correctAnswer={recapData.correctAnswer}
            />
          </div>
        </div>
      )}

      {/* Quit Confirmation */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <QuitConfirmModal onConfirm={confirmQuitGame} onCancel={cancelQuit} />
          </div>
        </div>
      )}

      {/* Game Over Modal (backup) */}
      {matchEnded && (
        <div className="fixed inset-0 z-50">
          <GameOverModal scores={scores} currentUser={currentUser} onClose={() => navigate("/landing")} />
        </div>
      )}
    </div>
  );
}
