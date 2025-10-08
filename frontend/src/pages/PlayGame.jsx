/**
 * PlayGame Page (Real Multiplayer via Socket.IO)
 * ----------------------------------------------
 * Handles:
 * - Receiving questions from the backend
 * - Submitting answers in real-time
 * - Listening for next question / match end
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSocket } from "../services/socket";
import { api } from "../services/api";
import GameHeader from "../components/GameHeader";
import QuestionCard from "../components/QuestionCard";
import GameOverScreen from "../components/GameOverScreen";

const colors = {
  darkBlue: "#0A2442",
};

export default function PlayGame() {
  const navigate = useNavigate();
  const { matchId } = useParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [question, setQuestion] = useState(null);
  const [scoreboard, setScoreboard] = useState([]);
  const [scores, setScores] = useState({});
  const [matchEnded, setMatchEnded] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const socketRef = useRef(null);

  // Fetch current user for identification
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


  // --- Socket setup -------------------------------------------------
  useEffect(() => {
    if (!currentUser || !matchId) return;

    const token = localStorage.getItem("accessToken");
    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("joinMatch", { matchId, token });

      // Always request current question once joined
      setTimeout(() => {
        console.log("🔁 Requesting current question after connect (safety)");
        socket.emit("requestCurrentQuestion", { matchId });
      }, 500);
    });

    // 🧠 Receive all questions (including the first)
    socket.on("newQuestion", (data) => {
      console.log("🧠 New question received:", data);
      setQuestion(data);
      setIsAnswered(false);
      setCorrectAnswer(null);
    });

    socket.on("answerResult", ({ username, correct }) => {
      console.log(`📊 ${username} answered:`, correct ? "✅" : "❌");
      if (username === currentUser.username) {
        setCorrectAnswer(correct ? question?.answer : null);
        setIsAnswered(true);
      }
    });

    socket.on("playersUpdate", ({ players }) => {
      console.log("👥 playersUpdate:", players);

      const map = {};
      players.forEach((p) => (map[p.username] = p.score));
      setScores(map);
    });

    socket.on("matchEnded", ({ scores }) => {
      console.log("🏁 Match ended:", scores);
      setScores(scores);
      setMatchEnded(true);
    });

    socket.on("disconnect", () => {
      console.warn("⚠️ Disconnected from match server");
    });

    socket.connect();

    return () => {
      if (socket.connected) socket.emit("leaveMatch", { matchId });
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [currentUser, matchId]);


  // Auto-request current question if we don't have one
  useEffect(() => {
    if (!socketRef.current || !matchId || question) return;
    console.log("❓ No question found — requesting current question...");
    socketRef.current.emit("requestCurrentQuestion", { matchId });
  }, [question, matchId]);



  // --- Answer handler -----------------------------------------------
  const handleAnswer = (optionLabel) => {
    if (!socketRef.current || !question || isAnswered) return;
    setIsAnswered(true);
    socketRef.current.emit("submitAnswer", {
      matchId,
      answer: optionLabel,
    });
  };

  // --- Quit handler --------------------------------------------------
  const handleQuitGame = () => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("leaveMatch", { matchId });
      socket.disconnect();
    }
    navigate("/");
  };


  // --- UI states -----------------------------------------------------
  if (matchEnded) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0];
    return (
      <div
        className="min-h-screen text-white flex items-center justify-center"
        style={{ backgroundColor: colors.darkBlue }}
      >
        <GameOverScreen
          winner={{ username: winner[0], score: winner[1] }}
          score={scores[currentUser?.username] || 0}
          finalLeaderboard={sorted.map(([username, score]) => ({
            username,
            score,
          }))}
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
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2442] via-[#143B6E] to-[#0A2442] animate-pulse opacity-40" />

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Spinner */}
          <div className="w-16 h-16 border-4 border-t-transparent border-[#6EC5FF] rounded-full animate-spin mb-8"></div>

          {/* Text */}
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

        <main className="mt-8 flex flex-1 items-center justify-center">
          <QuestionCard
            question={{
              text: question.q,
              options: question.options.map((opt) => ({
                id: opt,
                label: opt,
              })),
            }}
            youAnswered={isAnswered}
            questionResolved={false}
            waitingOnOthers={false}
            onAnswer={(opt) => handleAnswer(opt.label)}
          />
        </main>
      </div>
    </div>
  );
}
