// ===========================
// Admin Panel: Question Management
// ===========================
// Features:
// - View all questions with category filtering
// - Import new questions from OpenTDB (5 per category or filtered by category)
// - Reset all questions (clears DB and fetches fresh set of 10 per category)
// - Delete individual questions
// - UI locking during async operations (prevents race conditions)
// ===========================

import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

const base =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ""
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : window.location.origin.replace(/\/$/, "");
const API_ROOT = `${base}/api/questions`;

// const API_ROOT = "http://localhost:3000/api/questions";

const initialStats = { total: 0, byCategory: [] };

export default function Admin() {
  const navigate = useNavigate();

  // ===========================
  // State Management
  // ===========================
  const [questions, setQuestions] = useState([]); // All questions from DB
  const [categories, setCategories] = useState(["All"]); // Available categories + "All" option
  const [selectedCategory, setSelectedCategory] = useState("All"); // Filter selection
  const [stats, setStats] = useState(initialStats); // Total count & per-category breakdown
  const [loading, setLoading] = useState(false); // Initial data load
  const [liveMatches, setLiveMatches] = useState([]); // Active runtime matches for admins
  const [refreshingMatches, setRefreshingMatches] = useState(false);
  const [importing, setImporting] = useState(false); // Import operation in progress
  const [resetting, setResetting] = useState(false); // Reset operation in progress
  const [error, setError] = useState(null); // Error message display
  const [editingId, setEditingId] = useState(null);
  const [editingPayload, setEditingPayload] = useState(null);

  // Derived state
  const categoryCount = Math.max(categories.length - 1, 0); // Exclude "All" from count
  const estimatedImportTotal = categoryCount * 5;

  // UI lock: Disable all controls while async operation in progress
  const isBusy = importing || resetting;

  // ===========================
  // Effects
  // ===========================

  // Initial load on mount
  useEffect(() => {
    loadEverything();
    loadLiveMatches();
  }, []);

  // Load live matches (admins only)
  async function loadLiveMatches() {
    setRefreshingMatches(true);
    try {
      const data = await api.getActiveMatches();
      // data.matches is expected
      setLiveMatches(data.matches || []);
    } catch (err) {
      console.error("Failed to load live matches:", err);
    } finally {
      setRefreshingMatches(false);
    }
  }

  // ===========================
  // Memoized Computed Values
  // ===========================

  /**
   * Filter questions based on selected category.
   * "All" shows everything, otherwise filter by exact category match.
   */
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === "All") {
      return questions;
    }
    return questions.filter((q) => q.category === selectedCategory);
  }, [questions, selectedCategory]);

  // ===========================
  // Data Loading
  // ===========================

  /**
   * Fetch all data needed for admin panel:
   * - Statistics (total count, per-category breakdown)
   * - Available categories (for filter dropdown)
   * - All questions (for display/management)
   */
  async function loadEverything() {
    setError(null);
    setLoading(true);

    try {
      // Parallel fetch for faster load time
      const [statsRes, catRes, questionsRes] = await Promise.all([
        fetch(`${API_ROOT}/stats`),
        fetch(`${API_ROOT}/categories`),
        fetch(`${API_ROOT}/all`),
      ]);

      if (!statsRes.ok || !catRes.ok || !questionsRes.ok) {
        throw new Error("Failed to load admin data");
      }

      const statsData = await statsRes.json();
      const categoryData = await catRes.json();
      const questionData = await questionsRes.json();

      setStats(statsData);
      setCategories(["All", ...categoryData]); // Prepend "All" option
      setQuestions(questionData);
    } catch (err) {
      console.error(err);
      setError("Unable to load questions. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  // ===========================
  // Action Handlers
  // ===========================

  /**
   * Import questions from OpenTDB.
   *
   * Behavior:
   * - If "All" selected: Import {amount} questions for EACH category
   * - If specific category selected: Import {amount} questions for THAT category only
   * - Guard clause: Block if another operation is in progress (isBusy)
   * - Confirmation prompt: Shows estimate of how many questions will be imported
   * - Detailed result: Shows per-category breakdown (inserted, skipped)
   *
   * @param {number} amount - Number of questions per category (default: 5)
   */
  async function handleImport(amount = 5) {
    // Guard: Prevent overlapping operations
    if (importing || resetting) return;

    // Build confirmation message based on filter selection
    const isAll = selectedCategory === "All";
    const categoryCount = Math.max(categories.length - 1, 0);
    const totalEstimate = isAll ? categoryCount * amount : amount;
    const promptMessage = isAll
      ? categoryCount
        ? `Import ${amount} questions for each of the ${categoryCount} categories? (≈${totalEstimate} total)`
        : `Import ${amount} questions per category?`
      : `Import ${amount} ${selectedCategory} question${
          amount === 1 ? "" : "s"
        }?`;

    const confirmed = window.confirm(promptMessage);
    if (!confirmed) return;

    // Lock UI during operation
    setImporting(true);
    setError(null);

    try {
      // Call backend import endpoint with category filter
      const response = await fetch(`${API_ROOT}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          category: isAll ? "All" : selectedCategory, // Backend handles "All" vs specific category
        }),
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      // Parse result and build user-friendly summary
      const result = await response.json();
      const lines = [
        `Imported ${result.totalImported} new question${
          result.totalImported === 1 ? "" : "s"
        }. Skipped ${result.totalSkipped}.`,
      ];

      // Add per-category breakdown if available
      if (Array.isArray(result.details) && result.details.length > 0) {
        lines.push(
          "",
          ...result.details.map((detail) => {
            const inserted = detail.inserted ?? 0;
            const skipped = detail.skipped ?? 0;
            return `${detail.category}: +${inserted} / ${
              detail.requested
            } requested${skipped ? ` (skipped ${skipped})` : ""}`;
          })
        );
      }

      alert(lines.join("\n"));

      // Reload all data to reflect new questions
      await loadEverything();
    } catch (err) {
      console.error(err);
      setError("Import failed. Please check the server logs.");
    } finally {
      // Unlock UI
      setImporting(false);
    }
  }

  /**
   * Reset all questions: Nuclear option that clears DB and reseeds.
   *
   * Behavior:
   * - Deletes ALL questions (and related answers/match_questions)
   * - Fetches fresh set of 10 questions per category from OpenTDB
   * - Guard clause: Block if another operation is in progress
   * - Confirmation prompt: Warns user about destructive action
   * - Detailed result: Shows per-category breakdown
   */
  async function handleReset() {
    // Guard: Prevent overlapping operations
    if (resetting || importing) return;

    // Confirm destructive action
    const confirmed = window.confirm(
      "This will remove all trivia questions and fetch a fresh set (10 per category). Continue?"
    );
    if (!confirmed) return;

    // Lock UI during operation
    setResetting(true);
    setError(null);

    try {
      // Call backend reset endpoint (no body needed)
      const response = await fetch(`${API_ROOT}/reset`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Reset failed");
      }

      // Parse result and build summary
      const result = await response.json();
      const lines = [
        `Database refreshed with ${result.totalSeeded ?? 0} question${
          result.totalSeeded === 1 ? "" : "s"
        }.`,
      ];

      // Add per-category breakdown
      if (Array.isArray(result.details) && result.details.length > 0) {
        lines.push(
          "",
          ...result.details.map((detail) => {
            const inserted = detail.inserted ?? 0;
            const skipped = detail.skipped ?? 0;
            return `${detail.category}: +${inserted} / ${
              detail.requested
            } requested${skipped ? ` (skipped ${skipped})` : ""}`;
          })
        );
      }

      alert(lines.join("\n"));

      // Reload all data to reflect fresh questions
      await loadEverything();
    } catch (err) {
      console.error(err);
      setError("Reset failed. Please check the server logs.");
    } finally {
      // Unlock UI
      setResetting(false);
    }
  }

  /**
   * Delete a single question by ID.
   *
   * Guard clause: Block if another operation is in progress.
   * Optimistic update: Removes from local state immediately (no reload needed).
   */
  async function handleDelete(id) {
    // Guard: Prevent deletion during import/reset
    if (isBusy) return;

    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_ROOT}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Delete failed");
      }

      // Optimistic update: Remove from local state immediately
      setQuestions((current) => current.filter((q) => q.id !== id));
      setStats((current) => ({ ...current, total: current.total - 1 }));
    } catch (err) {
      console.error(err);
      alert("Could not delete this question. Try again.");
    }
  }

  /**
   * Manually refresh all data from server.
   * Guard clause: Block if another operation is in progress.
   */
  async function handleRefresh() {
    if (isBusy) return;
    await loadEverything();
    await loadLiveMatches();
  }

  async function handleAdminKick(matchId, userId) {
    const ok = window.confirm(
      "Kick this player from the match? They will receive a message and this game won't count."
    );
    if (!ok) return;
    try {
      await api.adminKickPlayer(matchId, userId);
      alert("Player kicked.");
      await loadLiveMatches();
    } catch (err) {
      console.error(err);
      alert("Failed to kick player. See console for details.");
    }
  }

  async function handleAdminEnd(matchId) {
    const ok = window.confirm(
      "End this match for all players? No stats will be saved."
    );
    if (!ok) return;
    try {
      await api.adminEndMatch(matchId);
      alert("Match ended.");
      await loadLiveMatches();
      // Also reload DB-backed matches list
      await loadEverything();
    } catch (err) {
      console.error(err);
      alert("Failed to end match. See console for details.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1d3c] via-[#132852] to-[#0b1d3c] text-white">
      <header className="border-b border-white/20 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <button
            onClick={() => navigate(-1)}
            disabled={isBusy}
            className="rounded-lg border border-white/50 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:border-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ← Dashboard
          </button>
          <h1 className="text-2xl font-black uppercase tracking-widest text-yellow-300">
            Question Admin
          </h1>
          <button
            onClick={() => navigate("/")}
            disabled={isBusy}
            className="rounded-lg border border-red-400 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Live matches panel for admins */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Live Matches</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={loadLiveMatches}
                disabled={refreshingMatches}
                className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-semibold"
              >
                {refreshingMatches ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          {liveMatches.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              No active matches right now.
            </div>
          ) : (
            <div className="space-y-3">
              {liveMatches.map((m) => (
                <div
                  key={m.matchId}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white/60">
                        {m.category || "Unknown"} ·{" "}
                        {m.title || `Match ${m.matchId}`}
                      </div>
                      <div className="text-xs text-white/70">
                        Players: {m.players.length} · Status: {m.status}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdminEnd(m.matchId)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold"
                      >
                        End Match
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {m.players.map((p) => (
                      <div
                        key={p.userId}
                        className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2"
                      >
                        <div className="text-sm">
                          <div className="font-semibold">{p.username}</div>
                          <div className="text-xs text-white/60">
                            Score: {p.score}
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={() => handleAdminKick(m.matchId, p.userId)}
                            className="rounded-md bg-yellow-500 px-2 py-1 text-xs font-semibold text-black"
                          >
                            Kick
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow">
            <p className="text-sm uppercase text-white/60">Total questions</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow md:col-span-2">
            <p className="mb-3 text-sm uppercase text-white/60">By category</p>
            <div className="flex flex-wrap gap-2">
              {stats.byCategory.length === 0 && (
                <span className="text-white/50">None yet</span>
              )}
              {stats.byCategory.map((row) => (
                <span
                  key={row.category}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold"
                >
                  {row.category}: {row.count}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => handleImport(5)}
            disabled={isBusy}
            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importing
              ? "Importing…"
              : selectedCategory === "All"
              ? categoryCount > 0
                ? "Import 5 questions per category"
                : "Import questions"
              : `Import 5 ${selectedCategory} questions`}
          </button>
          <button
            onClick={handleReset}
            disabled={isBusy}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resetting ? "Resetting…" : "Reset questions"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading || isBusy}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            disabled={isBusy}
            className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm"
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <span className="self-center text-sm text-white/70">
            Showing {filteredQuestions.length} question
            {filteredQuestions.length === 1 ? "" : "s"}
          </span>
        </section>

        {error && (
          <div className="mb-4 rounded-lg border border-red-400 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="space-y-4">
          {loading && questions.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
              Loading questions…
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-white/50">
              No questions yet. Use the import button to fetch trivia.
            </div>
          ) : (
            filteredQuestions.map((question) => {
              const isEditing = editingId === question.id;
              return (
                <article
                  key={question.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 shadow"
                >
                  <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm uppercase tracking-wide text-white/60">
                        {question.category} · {question.difficulty ?? "unknown"}
                      </p>
                      {!isEditing ? (
                        <h2 className="text-lg font-semibold text-white">
                          {question.question}
                        </h2>
                      ) : (
                        <div className="flex items-center gap-3">
                          <select
                            value={editingPayload?.category ?? ""}
                            onChange={(e) =>
                              setEditingPayload((p) => ({
                                ...p,
                                category: e.target.value,
                              }))
                            }
                            className="w-44 rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
                          >
                            {categories
                              .filter((c) => c !== "All")
                              .map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                          </select>

                          <select
                            value={editingPayload?.difficulty ?? ""}
                            onChange={(e) =>
                              setEditingPayload((p) => ({
                                ...p,
                                difficulty: e.target.value,
                              }))
                            }
                            className="w-40 rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
                          >
                            <option value="easy">easy</option>
                            <option value="medium">medium</option>
                            <option value="hard">hard</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(question.id);
                              setEditingPayload({
                                category: question.category,
                                difficulty: question.difficulty ?? "",
                                question: question.question,
                                correct: question.correct,
                                options: question.options,
                              });
                            }}
                            className="rounded-md border border-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            disabled={isBusy}
                            className="rounded-md border border-red-400 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={async () => {
                              // Save changes
                              try {
                                const payload = { ...editingPayload };
                                // Ensure options is an array of strings
                                if (typeof payload.options === "string") {
                                  payload.options = payload.options
                                    .split("||")
                                    .map((s) => s.trim());
                                }

                                await api.updateQuestion(question.id, payload);
                                // Update local state
                                setQuestions((qs) =>
                                  qs.map((q) =>
                                    q.id === question.id
                                      ? { ...q, ...payload }
                                      : q
                                  )
                                );
                                setEditingId(null);
                                setEditingPayload(null);
                              } catch (err) {
                                console.error(err);
                                alert("Failed to save changes. See console.");
                              }
                            }}
                            className="rounded-md bg-green-500 px-3 py-1 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingPayload(null);
                            }}
                            className="rounded-md border border-white/20 px-3 py-1 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </header>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <input
                          value={editingPayload?.question ?? ""}
                          onChange={(e) =>
                            setEditingPayload((p) => ({
                              ...p,
                              question: e.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
                          placeholder="Question"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-white/60">
                          Correct answer
                        </label>
                        <input
                          value={editingPayload?.correct ?? ""}
                          onChange={(e) =>
                            setEditingPayload((p) => ({
                              ...p,
                              correct: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
                          placeholder="Correct answer"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-white/60">
                          Options (separate by double-pipe '||')
                        </label>
                        <input
                          value={
                            Array.isArray(editingPayload?.options)
                              ? editingPayload.options.join("||")
                              : editingPayload?.options ?? ""
                          }
                          onChange={(e) =>
                            setEditingPayload((p) => ({
                              ...p,
                              options: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
                          placeholder="option1 || option2 || option3 || option4"
                        />
                      </div>
                    </div>
                  ) : (
                    <ul className="grid gap-2 md:grid-cols-2">
                      {question.options.map((option) => {
                        const isCorrect = option === question.correct;
                        return (
                          <li
                            key={option}
                            className={`rounded-md border px-3 py-2 text-sm ${
                              isCorrect
                                ? "border-green-400 bg-green-500/10 text-green-200"
                                : "border-white/10 bg-black/20 text-white/80"
                            }`}
                          >
                            {option}
                            {isCorrect && (
                              <span className="ml-2 text-xs uppercase">
                                (correct)
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
