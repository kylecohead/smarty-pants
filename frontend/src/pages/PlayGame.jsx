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

    // When answer result received
    socket.on("answerResult", ({ username, correct, points }) => {
      if (username === currentUser.username) {
        setIsAnswered(true);
        setShowRecap(true);

        // Build per-question leaderboard
        const leaderboard = buildPerQuestionLeaderboard(
          Object.entries(scores).reduce((acc, [user, score]) => {
            acc[user] = { player: { username: user }, score };
            return acc;
          }, {}),
          scores[currentUser.username] || 0,
          scores
        );

        setRecapData({ correct, points });
        clearInterval(timerRef.current);
        clearTimeout(timeoutGuardRef.current);
        setTimeout(() => setShowRecap(false), 3000);
      }
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
        if (t <= 1000) {
          clearInterval(timerRef.current);
          if (!isAnsweredRef.current) handleAnswer(null);
          return 0;
        }
        return t - 1000;
      });
    }, 1000);
  };

  const handleAnswer = (optionLabel) => {
    if (isAnswered || !socketRef.current || !question) return;
    setIsAnswered(true);
    clearInterval(timerRef.current);
    clearTimeout(timeoutGuardRef.current);

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
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-white text-center relative overflow-hidden"
        style={{ backgroundColor: colors.darkBlue }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2442] via-[#123E68] to-[#0A2442] opacity-50 animate-pulse" />
        <div className="relative z-10">
          <h1
            className={`text-5xl font-black mb-6 drop-shadow-lg ${
              recapData.correct ? "text-smart-green" : "text-red-400"
            }`}
          >
            {recapData.correct ? "✔ Correct!" : "✖ Wrong!"}
          </h1>
          <p className="text-xl mb-2">
            {recapData.correct ? "Nice work!" : "Better luck next time."}
          </p>
          <p className="text-lg mb-6">+{recapData.points} points earned</p>
          <div className="text-sm text-blue-300 animate-pulse">
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
          currentQuestion={question.index + 1}
          totalQuestions={undefined}
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
