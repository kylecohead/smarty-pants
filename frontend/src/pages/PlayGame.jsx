/**
 * Game Page: trivia gameplay loop with simulated multiplayer.
 * - Each question runs on a configurable timer (defaults to 10 seconds).
 * - We now wait until either all players answer OR the timer expires before
 *   resolving the question. If anyone misses the timer, they earn zero.
 * - Simulated players expose timing metadata so future socket integration is easy.
 */
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { QUESTIONS } from "../data/questions";
import { SIMULATED_PLAYERS } from "../data/simulatedPlayers";
import { RECAP_DELAY_SECONDS, FINAL_DELAY_SECONDS } from "../config/gameConfig";

const DEFAULT_QUESTION_DURATION_SECONDS = 10;
const TIMER_TICK_MS = 100;
const YOU_ID = "p1";
const DEFAULT_YOU_NAME = "You";

const colors = {
  darkBlue: "#0A2442",
  accentA: "#32D399",
  accentB: "#6EC5FF",
  accentC: "#FFC857",
  accentD: "#FF8FAB",
};

function createInitialSimTotals() {
  const totals = {};
  SIMULATED_PLAYERS.forEach((player) => {
    totals[player.id] = 0;
  });
  return totals;
}

function createBlankResponses(youName) {
  const base = {
    [YOU_ID]: {
      player: { id: YOU_ID, name: youName, isYou: true },
      answered: false,
      timedOut: false,
      isCorrect: false,
      answerTimeMs: null,
      score: 0,
      selectedOptionId: null,
    },
  };

  SIMULATED_PLAYERS.forEach((player) => {
    base[player.id] = {
      player: { id: player.id, name: player.name, isYou: false },
      answered: false,
      timedOut: false,
      isCorrect: false,
      answerTimeMs: null,
      score: 0,
      selectedOptionId: null,
    };
  });

  return base;
}

function calculateScore(isCorrect, answerTimeMs, questionDurationMs) {
  if (!isCorrect) return 0;
  const clamped = Math.max(0, Math.min(answerTimeMs, questionDurationMs));
  const secondsLeft = Math.max(
    0,
    Math.floor((questionDurationMs - clamped) / 1000)
  );
  return secondsLeft * 10;
}

function buildPerQuestionLeaderboard(responses, youTotalAfter, simTotalsAfter) {
  const rows = Object.values(responses).map((entry) => ({
    id: entry.player.id,
    name: entry.player.name,
    round: entry.score,
    total: entry.player.isYou
      ? youTotalAfter
      : simTotalsAfter[entry.player.id] ?? 0,
    isYou: entry.player.isYou,
  }));

  rows.sort((a, b) => b.total - a.total || b.round - a.round);
  return rows;
}

function buildFinalLeaderboard(youTotal, simTotals, youName) {
  const rows = [
    { id: YOU_ID, name: youName, total: youTotal, isYou: true },
    ...SIMULATED_PLAYERS.map((player) => ({
      id: player.id,
      name: player.name,
      total: simTotals[player.id] ?? 0,
      isYou: false,
    })),
  ];

  rows.sort((a, b) => b.total - a.total);
  return rows;
}

export default function PlayGame() {
  const navigate = useNavigate();
  const location = useLocation();

  const [questionDurationMs] = useState(() => {
    const fromState = Number(location.state?.timerSeconds);
    if (Number.isFinite(fromState) && fromState > 0) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "questionDurationSeconds",
          String(fromState)
        );
      }
      return fromState * 1000;
    }

    if (typeof window !== "undefined") {
      const stored = Number(
        window.sessionStorage.getItem("questionDurationSeconds")
      );
      if (Number.isFinite(stored) && stored > 0) {
        return stored * 1000;
      }
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "questionDurationSeconds",
        String(DEFAULT_QUESTION_DURATION_SECONDS)
      );
    }

    return DEFAULT_QUESTION_DURATION_SECONDS * 1000;
  });

  const youName = DEFAULT_YOU_NAME;

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [simTotals, setSimTotals] = useState(() => createInitialSimTotals());
  const [timeLeftMs, setTimeLeftMs] = useState(questionDurationMs);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [questionResolved, setQuestionResolved] = useState(false);
  const [responses, setResponses] = useState(() =>
    createBlankResponses(youName)
  );

  const isRecapOpen = location.pathname.endsWith("/pause");
  const total = QUESTIONS.length;
  const finished = index >= total;
  const question = finished ? null : QUESTIONS[index];
  const finalRows = buildFinalLeaderboard(score, simTotals, youName);
  const winner = finalRows[0];

  const questionStartRef = useRef(Date.now());
  const resolvedRef = useRef(false);
  const simTimeoutsRef = useRef([]);
  const simTotalsRef = useRef(simTotals);
  const responsesRef = useRef(responses);

  useEffect(() => {
    simTotalsRef.current = simTotals;
  }, [simTotals]);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  const handleQuitGame = () => {
    navigate("/", { replace: true });
  };

  function clearSimulatedTimers() {
    simTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    simTimeoutsRef.current = [];
  }

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

    if (index === total - 1) {
      const finalLeaderboard = buildFinalLeaderboard(
        youTotalAfter,
        updatedSimTotals,
        youName
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

  function checkForResolution() {
    if (resolvedRef.current) return;
    const snapshot = Object.values(responsesRef.current);
    const everyoneDone = snapshot.every(
      (entry) => entry.answered || entry.timedOut
    );
    if (everyoneDone) {
      resolveQuestion("all-answered");
    }
  }

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

  function handleTimeExpired() {
    if (resolvedRef.current) return;

    setResponses((prev) => {
      const next = { ...prev };
      let mutated = false;

      Object.entries(prev).forEach(([id, entry]) => {
        if (!entry.answered) {
          mutated = true;
          next[id] = {
            ...entry,
            answered: true,
            timedOut: true,
            isCorrect: false,
            answerTimeMs: questionDurationMs,
            score: 0,
          };
        }
      });

      if (mutated) {
        responsesRef.current = next;
      }
      return mutated ? next : prev;
    });

    resolveQuestion("timer-expired");
  }

  // Timer + simulated player scheduling for each question
  useEffect(() => {
    if (finished || isRecapOpen) return undefined;

    const baseResponses = createBlankResponses(youName);
    responsesRef.current = baseResponses;
    setResponses(baseResponses);

    questionStartRef.current = Date.now();
    resolvedRef.current = false;
    setQuestionResolved(false);

    clearSimulatedTimers();

    const timers = [];
    SIMULATED_PLAYERS.forEach((player) => {
      const answer = player.answers[index];
      if (!answer) return;
      if (answer.timeToAnswerMs >= questionDurationMs) return;

      const timeoutId = setTimeout(() => {
        storeAnswer(player.id, {
          isCorrect: answer.isCorrect,
          answerTimeMs: answer.timeToAnswerMs,
        });
      }, Math.max(0, answer.timeToAnswerMs));
      timers.push(timeoutId);
    });

    simTimeoutsRef.current = timers;
    setTimeLeftMs(questionDurationMs);

    const interval = setInterval(() => {
      if (resolvedRef.current) {
        clearInterval(interval);
        return;
      }

      setTimeLeftMs((prev) => {
        const next = prev - TIMER_TICK_MS;
        if (next <= 0) {
          clearInterval(interval);
          if (!resolvedRef.current) {
            handleTimeExpired();
          }
          return 0;
        }
        return next;
      });
    }, TIMER_TICK_MS);

    return () => {
      clearInterval(interval);
      clearSimulatedTimers();
    };
  }, [index, finished, isRecapOpen, questionDurationMs, youName]);

  // Called when player clicks an option button
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

  // When recap modal closes and we have a pending advance, go to next question
  useEffect(() => {
    if (!isRecapOpen && pendingAdvance) {
      setPendingAdvance(false);
      setIndex((i) => i + 1);
    }
  }, [isRecapOpen, pendingAdvance]);

  const youResponse = responses[YOU_ID];
  const youAnswered = Boolean(youResponse?.answered);
  const waitingOnOthers = youAnswered && !questionResolved && !finished;

  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: colors.darkBlue }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/lobby"
            className="w-fit rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-semibold tracking-wide text-white transition hover:bg-white/20"
          >
            ← Back to Lobby
          </Link>
          <div className="flex flex-col items-start sm:items-end">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Score
            </p>
            <span className="font-heading text-3xl font-black text-smart-green">
              {score}
            </span>
            {!finished && (
              <p className="mt-1 text-xs uppercase tracking-[0.35em] text-white/40">
                Question {index + 1} / {total}
              </p>
            )}
            <button
              type="button"
              onClick={handleQuitGame}
              className="mt-4 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20 sm:w-auto"
            >
              Quit
            </button>
          </div>
        </header>

        <main className="mt-8 flex flex-1 items-center justify-center">
          {!finished ? (
            <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-sm sm:p-10">
              <div className="mb-10 flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Time Remaining
                </p>
                <div className="h-3 w-full overflow-hidden rounded-full border border-white/20 bg-white/10">
                  <div
                    className="h-full bg-smart-green transition-[width] duration-100 ease-linear"
                    style={{
                      width: `${
                        questionDurationMs > 0
                          ? (timeLeftMs / questionDurationMs) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <p className="font-heading text-3xl font-black leading-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
                {question?.text}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {question?.options.map((opt, i) => {
                  const colorClasses = [
                    "bg-gradient-to-br from-[#FF8FAB] to-[#FF5F87]",
                    "bg-gradient-to-br from-[#6EC5FF] to-[#4F8CFF]",
                    "bg-gradient-to-br from-[#FFC857] to-[#FFAE42] text-black",
                    "bg-gradient-to-br from-[#32D399] to-[#0FB57D]",
                  ];
                  const baseClass = colorClasses[i % colorClasses.length];
                  const disabledClass =
                    youAnswered || questionResolved
                      ? "opacity-60 cursor-not-allowed"
                      : "";

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(opt.id)}
                      disabled={youAnswered || questionResolved}
                      className={`group relative overflow-hidden rounded-2xl border border-white/10 px-6 py-8 text-xl font-bold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${baseClass} ${disabledClass}`}
                    >
                      <span className="relative z-10 block drop-shadow-sm">
                        {opt.label}
                      </span>
                      <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-20 group-focus-visible:opacity-20" />
                    </button>
                  );
                })}
              </div>

              {waitingOnOthers && (
                <p className="mt-6 text-sm font-medium text-white/70">
                  Waiting for other players to finish…
                </p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-12">
              <h2 className="font-heading text-4xl font-black text-smart-light-blue">
                Smartie Pants Champion
              </h2>
              <p className="mt-2 text-lg uppercase tracking-[0.3em] text-white/60">
                {winner?.isYou
                  ? "You did it!"
                  : `${winner?.name} takes the crown`}
              </p>
              <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-extrabold text-white shadow-lg">
                {winner?.isYou ? "You" : winner?.name}
              </div>
              <p className="mt-6 text-lg text-white/80">
                Your Score:{" "}
                <span className="font-heading text-3xl text-smart-green">
                  {score}
                </span>
              </p>
              <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <table className="w-full border-collapse text-left text-sm sm:text-base">
                  <thead className="bg-white/10 uppercase tracking-[0.25em] text-white/60">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalRows.map((row, i) => (
                      <tr
                        key={row.id}
                        className={`border-t border-white/10 ${
                          row.isYou ? "bg-white/15" : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-white/90">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          {row.name}
                          {row.isYou && (
                            <span className="ml-2 rounded-full bg-smart-green/20 px-2 py-0.5 text-xs font-semibold text-smart-green">
                              You
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-white">
                          {row.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link
                to="/landing"
                className="mt-10 inline-block rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/20"
              >
                Return Home
              </Link>
            </div>
          )}
        </main>

        <Outlet />
      </div>
    </div>
  );
}
