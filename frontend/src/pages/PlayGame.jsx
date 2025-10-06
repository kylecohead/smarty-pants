/**
 * PlayGame Page: Trivia gameplay with simulated multiplayer.
 *
 * Responsibilities:
 * - Orchestrate game flow (questions, answers, scoring)
 * - Manage player responses (human + simulated)
 * - Navigate to recap/final modals
 * - Render game UI via extracted components
 */
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { SIMULATED_PLAYERS } from "../data/simulatedPlayers";
import { RECAP_DELAY_SECONDS, FINAL_DELAY_SECONDS } from "../config/gameConfig";
import {
  calculateScore,
  createInitialSimTotals,
  createBlankResponses,
  buildPerQuestionLeaderboard,
  buildFinalLeaderboard,
  checkAllPlayersDone,
  markUnansweredAsTimedOut,
  getQuestionDuration,
} from "../utils/gameUtils";
import { useGameTimer } from "../hooks/useGameTimer";
import { useSimulatedPlayers } from "../hooks/useSimulatedPlayers";
import GameHeader from "../components/GameHeader";
import QuestionCard from "../components/QuestionCard";
import GameOverScreen from "../components/GameOverScreen";

const YOU_ID = "p1";
const DEFAULT_YOU_NAME = "You";

const colors = {
  darkBlue: "#0A2442",
};

export default function PlayGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const matchId = params.matchId;

  // Game configuration
  const [questionDurationMs] = useState(() =>
    getQuestionDuration(location.state, 10)
  );

  // Fetch current user's username
  const [youName, setYouName] = useState(DEFAULT_YOU_NAME);

  // Questions state - fetches from database using matchId
  const [gameQuestions, setGameQuestions] = useState([]);
  const [loadingMatch, setLoadingMatch] = useState(true);

  // Fetch current user's profile to get their actual username
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch("http://localhost:3000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setYouName(data.user.username);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        // Keep default "You" if fetch fails
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch match data with questions from database
  useEffect(() => {
    if (!matchId) {
      // No matchId provided - redirect to home
      alert("No game found. Please create or join a game first.");
      navigate("/");
      return;
    }

    const fetchMatch = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:3000/api/matches/${matchId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch match: ${response.status}`);
        }

        const data = await response.json();

        // Transform database questions to game format
        const dbQuestions = data.questions.map((mq) => ({
          id: `q${mq.question.id}`,
          text: mq.question.question,
          options: mq.question.options.map((opt, idx) => ({
            id: String.fromCharCode(97 + idx), // 'a', 'b', 'c', 'd'
            label: opt,
          })),
          correctId: String.fromCharCode(
            97 + mq.question.options.indexOf(mq.question.correct)
          ),
          subject: mq.question.category,
        }));

        setGameQuestions(dbQuestions);
      } catch (error) {
        console.error("Error fetching match:", error);
        alert(`Failed to load match: ${error.message}`);
        navigate("/");
      } finally {
        setLoadingMatch(false);
      }
    };

    fetchMatch();
  }, [matchId, navigate]);

  // Game state
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [simTotals, setSimTotals] = useState(() =>
    createInitialSimTotals(SIMULATED_PLAYERS)
  );
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [questionResolved, setQuestionResolved] = useState(false);
  const [responses, setResponses] = useState(() =>
    createBlankResponses(YOU_ID, youName, SIMULATED_PLAYERS)
  );

  // Derived state
  const isRecapOpen = location.pathname.endsWith("/pause");
  const total = gameQuestions.length;
  const finished = index >= total;
  const question = finished ? null : gameQuestions[index];
  const finalRows = buildFinalLeaderboard(
    YOU_ID,
    score,
    simTotals,
    youName,
    SIMULATED_PLAYERS
  );
  const winner = finalRows[0];

  // Refs for managing state across async operations
  const simTotalsRef = useRef(simTotals);
  const responsesRef = useRef(responses);
  const resolvedRef = useRef(false);

  useEffect(() => {
    simTotalsRef.current = simTotals;
  }, [simTotals]);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  // Reset resolved state when question changes
  useEffect(() => {
    resolvedRef.current = false;
  }, [index]);

  // Navigation handlers
  const handleQuitGame = () => {
    navigate("/", { replace: true });
  };

  // Custom hooks
  const { timeLeftMs, questionStartRef } = useGameTimer(
    questionDurationMs,
    index,
    isRecapOpen,
    finished
  );

  const handleSimulatedAnswer = (playerId, answerData) => {
    storeAnswer(playerId, answerData);
  };

  const { clearSimulatedTimers } = useSimulatedPlayers(
    SIMULATED_PLAYERS,
    index,
    questionDurationMs,
    isRecapOpen,
    finished,
    handleSimulatedAnswer
  );

  /**
   * Store a player's answer and check if question should resolve.
   */
  function storeAnswer(
    playerId,
    { isCorrect, answerTimeMs, selectedOptionId }
  ) {
    if (resolvedRef.current) return;

    setResponses((prev) => {
      const existing = prev[playerId];
      if (!existing || existing.answered) {
        return prev;
      }

      const clampedTime = Math.max(
        0,
        Math.min(answerTimeMs, questionDurationMs)
      );
      const updated = {
        ...existing,
        answered: true,
        timedOut: false,
        isCorrect,
        answerTimeMs: clampedTime,
        score: calculateScore(isCorrect, clampedTime, questionDurationMs),
        selectedOptionId: selectedOptionId ?? existing.selectedOptionId,
      };

      const next = { ...prev, [playerId]: updated };
      responsesRef.current = next;
      return next;
    });

    setTimeout(checkForResolution, 0);
  }

  /**
   * Check if all players have answered or timed out.
   */
  function checkForResolution() {
    if (resolvedRef.current) return;
    if (checkAllPlayersDone(responsesRef.current)) {
      resolveQuestion("all-answered");
    }
  }

  /**
   * Resolve the current question and navigate to recap or final screen.
   */
  function resolveQuestion(reason) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setQuestionResolved(true);
    clearSimulatedTimers();

    const snapshot = responsesRef.current;
    const youEntry = snapshot[YOU_ID];
    const roundScore = youEntry?.score ?? 0;
    const youTotalAfter = score + roundScore;
    setScore(youTotalAfter);

    const updatedSimTotals = { ...simTotalsRef.current };
    Object.values(snapshot).forEach((entry) => {
      if (!entry.player.isYou) {
        updatedSimTotals[entry.player.id] =
          (updatedSimTotals[entry.player.id] ?? 0) + entry.score;
      }
    });
    setSimTotals(updatedSimTotals);

    const leaderboard = buildPerQuestionLeaderboard(
      snapshot,
      youTotalAfter,
      updatedSimTotals
    );

    const correctOption = question?.options.find(
      (o) => o.id === question?.correctId
    );
    const isCorrect = Boolean(youEntry?.isCorrect && !youEntry?.timedOut);

    // Navigate to final screen or recap
    if (index === total - 1) {
      const finalLeaderboard = buildFinalLeaderboard(
        YOU_ID,
        youTotalAfter,
        updatedSimTotals,
        youName,
        SIMULATED_PLAYERS
      );

      navigate("pause", {
        state: {
          mode: "final",
          questionIndex: index,
          leaderboard: finalLeaderboard,
          yourScore: youTotalAfter,
          nextInSeconds: FINAL_DELAY_SECONDS,
        },
      });

      setPendingAdvance(false);
      setIndex(total);
      return;
    }

    navigate("pause", {
      state: {
        mode: "recap",
        correct: isCorrect,
        points: roundScore,
        questionText: question?.text,
        correctAnswer: correctOption?.label,
        questionIndex: index,
        leaderboard,
        nextInSeconds: RECAP_DELAY_SECONDS,
        reason,
      },
    });

    setPendingAdvance(true);
  }

  /**
   * Handle player clicking an answer option.
   */
  function handleAnswer(optionId) {
    if (finished || !question || isRecapOpen || resolvedRef.current) return;

    const existing = responsesRef.current[YOU_ID];
    if (existing?.answered) return;

    const isCorrect = optionId === question.correctId;
    const elapsed = Date.now() - questionStartRef.current;

    storeAnswer(YOU_ID, {
      isCorrect,
      answerTimeMs: elapsed,
      selectedOptionId: optionId,
    });
  }

  /**
   * Handle timer expiration
   */
  useEffect(() => {
    if (timeLeftMs <= 0 && !resolvedRef.current && !finished && !isRecapOpen) {
      const updated = markUnansweredAsTimedOut(
        responsesRef.current,
        questionDurationMs
      );
      if (updated !== responsesRef.current) {
        setResponses(updated);
        responsesRef.current = updated;
      }
      resolveQuestion("timer-expired");
    }
  }, [timeLeftMs, finished, isRecapOpen, questionDurationMs]);

  /**
   * Advance to next question when recap modal closes.
   */
  useEffect(() => {
    if (!isRecapOpen && pendingAdvance) {
      setPendingAdvance(false);
      setIndex((i) => i + 1);
    }
  }, [isRecapOpen, pendingAdvance]);

  // Reset responses when new question starts
  useEffect(() => {
    if (finished || isRecapOpen) return;
    const baseResponses = createBlankResponses(
      YOU_ID,
      youName,
      SIMULATED_PLAYERS
    );
    responsesRef.current = baseResponses;
    setResponses(baseResponses);
    setQuestionResolved(false);
  }, [index, finished, isRecapOpen, youName]);

  const youResponse = responses[YOU_ID];
  const youAnswered = Boolean(youResponse?.answered);
  const waitingOnOthers = youAnswered && !questionResolved && !finished;

  // Show loading screen while fetching match data
  if (loadingMatch) {
    return (
      <div
        className="min-h-screen text-white flex items-center justify-center"
        style={{ backgroundColor: colors.darkBlue }}
      >
        <div className="text-center">
          <div className="text-2xl font-heading mb-4">Loading Match...</div>
          <div className="text-smart-light-blue animate-pulse">Please wait</div>
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
          score={score}
          currentQuestion={index}
          totalQuestions={total}
          onQuit={handleQuitGame}
        />

        <main className="mt-8 flex flex-1 items-center justify-center">
          {!finished ? (
            <QuestionCard
              question={question}
              timeLeftMs={timeLeftMs}
              questionDurationMs={questionDurationMs}
              youAnswered={youAnswered}
              questionResolved={questionResolved}
              waitingOnOthers={waitingOnOthers}
              onAnswer={handleAnswer}
            />
          ) : (
            <GameOverScreen
              winner={winner}
              score={score}
              finalLeaderboard={finalRows}
            />
          )}
        </main>

        <Outlet />
      </div>
    </div>
  );
}
