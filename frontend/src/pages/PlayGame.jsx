/**
 * PlayGame Page (Real Multiplayer via Socket.IO)
 * ----------------------------------------------
 * Combines real-time multiplayer logic with simulated game's visuals.
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSocket } from "../services/socket";
import { api } from "../services/api";
import GameHeader from "../components/GameHeader";
import QuestionCard from "../components/QuestionCard";
import GameOverScreen from "../components/GameOverScreen";
import QuestionRecapModal from "../modals/QuestionRecapModal";
import GameOverModal from "../modals/GameOverModal";
import QuitConfirmModal from "../modals/QuitConfirmModal";
import {
  buildPerQuestionLeaderboard,
  buildFinalLeaderboard,
} from "../utils/gameUtils";

const colors = { darkBlue: "#0A2442" };

export default function PlayGame() {
  const navigate = useNavigate();
  const { matchId } = useParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [question, setQuestion] = useState(null);
  const [scores, setScores] = useState({});
  const [matchEnded, setMatchEnded] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [recapData, setRecapData] = useState(null);
  const [showRecap, setShowRecap] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const timeoutGuardRef = useRef(null);
  const questionStartTimeRef = useRef(0);
  const timeLeftRef = useRef(0);
  const isAnsweredRef = useRef(isAnswered);
  useEffect(() => {
    isAnsweredRef.current = isAnswered;
  }, [isAnswered]);

  // Fetch user
  useEffect(() => {
    (async () => {
      try {
        const data = await api.getCurrentUser();
        setCurrentUser(data.user);
      } catch (err) {
        console.error(" Failed to fetch user:", err);
      }
    })();
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

    // When new question arrives
    socket.on("newQuestion", (data) => {
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);

      setQuestion(data);
      setIsAnswered(false);
      setShowRecap(false);
      setRecapData(null);

      timeoutGuardRef.current = setTimeout(
        () => startTimer(data.timeLimit || 10000),
        200
      );
    });

    // Individual answer confirmation (immediate feedback)
    socket.on("answerSubmitted", ({ correct, points, correctAnswer }) => {
      if (!isAnswered) {
        setIsAnswered(true);
        // DON'T clear the timer - let it keep running for synchronized leaderboard
        // clearInterval(timerRef.current); // REMOVED
        clearTimeout(timeoutGuardRef.current);

        // Just show a simple "Answer submitted" state
        console.log(
          ` Answer submitted: ${correct ? "Correct" : "Wrong"} (+${points})`
        );
      }
    });

    // Question results for all players (after everyone answered or time up)
    socket.on("questionResults", ({ responses, scores, correctAnswer }) => {
      setScores(scores);

      // Find your response
      const yourResponse = responses.find(
        (r) => r.username === currentUser.username
      );

      // Build leaderboard with both total and round scores
      const currentLeaderboard = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([playerName, totalScore], index) => {
          const playerResponse = responses.find(
            (r) => r.username === playerName
          );
          return {
            id: index,
            name: playerName,
            total: totalScore,
            round: playerResponse ? playerResponse.points : 0,
            answered: playerResponse ? playerResponse.answered : false,
            correct: playerResponse ? playerResponse.correct : false,
            isYou: playerName === currentUser.username,
          };
        });

      const recapDataToShow = {
        correct: yourResponse?.correct || false,
        points: yourResponse?.points || 0,
        leaderboard: currentLeaderboard,
        allResponses: responses, // Include all player responses
      };

      // WAIT for the visual timer to hit 0 before showing leaderboard
      // This ensures the timer bar is empty when the leaderboard pops up
      const timeRemaining = timeLeftRef.current;
      if (timeRemaining > 100) {
        // If there's still time on the clock, wait for it
        setTimeout(() => {
          setRecapData(recapDataToShow);
          setShowRecap(true);
          setTimeLeft(0);
          timeLeftRef.current = 0;
          clearInterval(timerRef.current);
          clearTimeout(timeoutGuardRef.current);
          setTimeout(() => setShowRecap(false), 4000);
        }, timeRemaining);
      } else {
        // Timer already at 0 or very close, show immediately
        setRecapData(recapDataToShow);
        setShowRecap(true);
        setTimeLeft(0);
        timeLeftRef.current = 0;
        clearInterval(timerRef.current);
        clearTimeout(timeoutGuardRef.current);
        setTimeout(() => setShowRecap(false), 4000);
      }
    });

    socket.on("playersUpdate", ({ players }) => {
      const map = {};
      players.forEach((p) => (map[p.username] = p.score));
      setScores(map);
    });

    socket.on("matchEnded", async ({ scores }) => {
      setScores(scores);
      setMatchEnded(true);
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);

      try {
        if (currentUser) {
          // Increment games played once the match has ended
          await api.incrementGamesPlayed(currentUser.id);

          // Check is the current user is the winner
          const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
          const winner = sortedScores[0];

          // If current user is the winner, increment their wins count
          if (winner && winner[0] === currentUser.username) {
            await api.incrementUserWins(currentUser.id);
          }
        }
      } catch (error) {
        console.error("Failed to update user stats:", error);
      }
    });

    socket.on("hostLeft", ({ message, scores }) => {
      console.log("👑 Host left the game:", message);
      setScores(scores || {});
      setMatchEnded(true);
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);
      // Show message to user
      alert(message);
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

  // Start countdown with smooth updates
  const startTimer = (duration) => {
    clearInterval(timerRef.current);
    const startTime = Date.now();
    setQuestionStartTime(startTime);
    questionStartTimeRef.current = startTime;
    setTimeLeft(duration);

    // Update timer every 100ms for smooth progress bar
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - questionStartTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);

      setTimeLeft(remaining);
      timeLeftRef.current = remaining; // Keep ref in sync

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (!isAnsweredRef.current) handleAnswer(null);
      }
    }, 100);
  };

  const handleAnswer = (optionLabel) => {
    if (isAnswered || !socketRef.current || !question) return;
    setIsAnswered(true);
    // DON'T clear the timer - let it keep running for synchronized display
    // clearInterval(timerRef.current); // REMOVED
    clearTimeout(timeoutGuardRef.current);

    const elapsedTimeMs = Date.now() - questionStartTimeRef.current;

    // Handle the case where no answer was selected (timer ran out)
    const finalAnswer = optionLabel || ""; // Convert null/undefined to empty string

    // console.log(" Submitting answer:", finalAnswer);
    // console.log(" Current question:", question);

    socketRef.current.emit("submitAnswer", {
      matchId,
      answer: finalAnswer,
      elapsedTimeMs,
    });
  };

  const handleQuitGame = () => {
    // Show confirmation modal before quitting
    setShowQuitConfirm(true);
  };

  const confirmQuitGame = () => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("leaveMatch", { matchId });
      socket.disconnect();
    }
    navigate("/landing");
  };

  const cancelQuit = () => {
    setShowQuitConfirm(false);
  };

  // ================== UI RENDERING ==================

  if (matchEnded) {
    // Create properly sorted leaderboard
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0];

    // Format leaderboard for GameOverScreen component
    const formattedLeaderboard = sorted.map(([username, score], index) => ({
      id: index,
      name: username,
      total: score,
      isYou: username === currentUser?.username,
    }));

    return (
      <div
        className="min-h-screen flex items-center justify-center text-white"
        style={{ backgroundColor: colors.darkBlue }}
      >
        <GameOverScreen
          winner={{
            name: winner[0], // Use 'name' not 'username'
            score: winner[1],
            isYou: winner[0] === currentUser?.username,
          }}
          score={scores[currentUser?.username] || 0}
          finalLeaderboard={formattedLeaderboard}
        />
      </div>
    );
  }

  if (!question) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden"
        style={{ backgroundColor: colors.darkBlue }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2442] via-[#143B6E] to-[#0A2442] opacity-60 animate-[pulse_3s_infinite]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-[#6EC5FF] rounded-full animate-spin mb-8"></div>
          <h1 className="text-3xl font-heading font-semibold mb-3 tracking-wide">
            Waiting for Host...
          </h1>
          <p className="text-[#6EC5FF] text-lg animate-pulse">
            The game will begin shortly
          </p>
        </div>
      </div>
    );
  }

  // ================== QUESTION DISPLAY ==================
  return (
    <div
      className="min-h-screen text-white relative"
      style={{ backgroundColor: colors.darkBlue }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
        <GameHeader
          score={scores[currentUser?.username] || 0}
          currentQuestion={question.index}
          totalQuestions={question.total || 5}
          onQuit={handleQuitGame}
        />

        <main className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
          <QuestionCard
            question={{
              text: question.q,
              options: question.options.map((opt) => ({
                id: opt,
                label: opt,
              })),
            }}
            timeLeftMs={timeLeft}
            questionDurationMs={question.timeLimit || 10000}
            youAnswered={isAnswered}
            questionResolved={showRecap}
            waitingOnOthers={isAnswered && !showRecap} // NEW: show waiting state
            onAnswer={(optionText) => handleAnswer(optionText)}
          />
        </main>
      </div>

      {/* Question Recap Modal Overlay */}
      {showRecap && recapData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <QuestionRecapModal
              correct={recapData.correct}
              points={recapData.points}
              leaderboard={recapData.leaderboard}
              allResponses={recapData.allResponses} // Pass this as a prop
              onClose={() => setShowRecap(false)}
            />
          </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <QuitConfirmModal
              onConfirm={confirmQuitGame}
              onCancel={cancelQuit}
            />
          </div>
        </div>
      )}

      {/* Game Over Modal Overlay */}
      {matchEnded && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <GameOverModal
              scores={scores}
              currentUser={currentUser}
              onClose={() => navigate("/landing")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
