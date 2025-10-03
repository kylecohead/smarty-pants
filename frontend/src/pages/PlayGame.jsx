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
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { QUESTIONS } from "../data/questions";
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

  // Game configuration
  const [questionDurationMs] = useState(() =>
    getQuestionDuration(location.state, 10)
  );
  const youName = DEFAULT_YOU_NAME;

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
  const total = QUESTIONS.length;
  const finished = index >= total;
  const question = finished ? null : QUESTIONS[index];
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
