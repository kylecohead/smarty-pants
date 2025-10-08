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

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const timeoutGuardRef = useRef(null);
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
        console.error("❌ Failed to fetch user:", err);
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

    // 🧠 When new question arrives
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

    // When answer result received (user answered before time ran out)
    socket.on(
      "answerResult",
      ({ username, correct, points, correctAnswer }) => {
        if (username === currentUser.username) {
          setIsAnswered(true);
          // Store result but DON'T show recap yet - wait for timer to expire
          setRecapData({ correct, points, correctAnswer });
          // Timer keeps running in the background
        }
      }
    );

    // When time runs out on the backend
    socket.on("timeUp", () => {
      console.log("⏰ TIMEUP EVENT RECEIVED - showing recap");
      // Show the recap now - backend will send newQuestion after 3 seconds which will clear it
      setShowRecap(true);
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);

      // DON'T hide it manually - let newQuestion event handle clearing the recap
    });

    socket.on("playersUpdate", ({ players }) => {
      const map = {};
      players.forEach((p) => (map[p.username] = p.score));
      setScores(map);
    });

    socket.on("matchEnded", ({ scores }) => {
      setScores(scores);
      setMatchEnded(true);
      clearInterval(timerRef.current);
      clearTimeout(timeoutGuardRef.current);
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

  // Start countdown
  const startTimer = (duration) => {
    clearInterval(timerRef.current);
    setTimeLeft(duration);
    setQuestionStartTime(Date.now());

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) {
          // Timer reached 0 - just show 0, let backend handle the timeout
          return 0;
        }
        return t - 1000;
      });
    }, 1000);
  };

  const handleAnswer = (optionLabel) => {
    if (isAnswered || !socketRef.current || !question) return;
    setIsAnswered(true);
    isAnsweredRef.current = true; // Update ref immediately
    // DON'T clear the timer - let it keep running visually
    // clearInterval(timerRef.current);
    // clearTimeout(timeoutGuardRef.current);

    const elapsedTimeMs = Date.now() - questionStartTime;

    // Handle the case where no answer was selected (timer ran out)
    const finalAnswer = optionLabel || ""; // Convert null/undefined to empty string

    // console.log("🔍 Submitting answer:", finalAnswer);
    // console.log("🔍 Current question:", question);

    socketRef.current.emit("submitAnswer", {
      matchId,
      answer: finalAnswer,
      elapsedTimeMs,
    });
  };

  const handleQuitGame = () => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("leaveMatch", { matchId });
      socket.disconnect();
    }
    navigate("/");
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

  if (showRecap && recapData) {
    // Build leaderboard from current scores
    const leaderboardData = Object.entries(scores)
      .map(([username, score]) => ({
        name: username,
        score: score,
        isYou: username === currentUser?.username,
      }))
      .sort((a, b) => b.score - a.score);

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-white text-center relative overflow-hidden px-4"
        style={{ backgroundColor: colors.darkBlue }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2442] via-[#123E68] to-[#0A2442] opacity-50 animate-pulse" />
        <div className="relative z-10 w-full max-w-2xl">
          <h1
            className={`text-5xl font-black mb-4 drop-shadow-lg ${
              recapData.correct ? "text-smart-green" : "text-red-400"
            }`}
          >
            {recapData.correct ? "✔ Correct!" : "✖ Wrong!"}
          </h1>
          <p className="text-xl mb-2">
            {recapData.correct ? "Nice work!" : "Better luck next time."}
          </p>
          {!recapData.correct && recapData.correctAnswer && (
            <p className="text-lg mb-2 text-white/80">
              Correct answer:{" "}
              <span className="font-semibold text-smart-green">
                {recapData.correctAnswer}
              </span>
            </p>
          )}
          <p className="text-lg mb-8">+{recapData.points} points earned</p>

          {/* Leaderboard */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="bg-white/10 px-4 py-3">
              <h3 className="text-lg font-semibold uppercase tracking-wider text-white/80">
                Current Standings
              </h3>
            </div>
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/5 text-sm uppercase tracking-wider text-white/60">
                <tr>
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Player</th>
                  <th className="px-4 py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, index) => (
                  <tr
                    key={player.name}
                    className={`border-t border-white/10 ${
                      player.isYou ? "bg-white/15" : "bg-transparent"
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-white/90">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {player.name}
                      {player.isYou && (
                        <span className="ml-2 rounded-full bg-smart-green/20 px-2 py-0.5 text-xs font-semibold text-smart-green">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">
                      {player.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-sm text-blue-300 animate-pulse">
            Next question starting...
          </div>
        </div>
      </div>
    );
  }

  // ================== QUESTION DISPLAY ==================
  return (
    <div
      className="min-h-screen text-white"
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
            questionResolved={false}
            waitingOnOthers={false}
            onAnswer={(optionText) => handleAnswer(optionText)} // Direct string, no .label needed
          />
        </main>
      </div>
    </div>
  );
}
