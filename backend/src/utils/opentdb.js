/**
 * OpenTDB API Utilities
 * 
 * Shared utilities for interacting with the Open Trivia Database API.
 * These functions are used across routes, seed scripts, and test utilities
 * to maintain consistency and reduce code duplication.
 */

/**
 * Decode HTML entities from OpenTDB API responses.
 * The API returns questions with HTML-encoded special characters.
 * 
 * @param {string} value - Text containing HTML entities
 * @returns {string} - Decoded text
 */
export const decodeText = (value = "") =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&shy;/g, "")
    .replace(/&eacute;/g, "é")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&auml;/g, "ä");

/**
 * Randomize array order using Fisher-Yates shuffle algorithm.
 * More efficient and readable than the map-sort approach.
 * 
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array (does not mutate original)
 */
export const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Pause execution for a specified duration.
 * Used for rate limiting and retry backoff logic.
 * 
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch questions from OpenTDB for a specific category with retry logic.
 * 
 * @param {number} categoryId - OpenTDB category ID (e.g., 9 for General Knowledge)
 * @param {string} displayName - Human-readable category name for database storage
 * @param {number} amount - Target number of questions to fetch
 * @returns {Promise<Array>} - Array of question objects ready for database insertion
 * 
 * Features:
 * - Retry logic: Up to 12 attempts to reach target question count
 * - Rate limit handling: Exponential backoff when API returns code 5
 * - Duplicate detection: Uses Map keyed by question text to avoid duplicates
 * - HTML entity decoding: Cleans up question/answer text
 * - Option shuffling: Randomizes answer order
 */
export async function fetchCategoryQuestions(categoryId, displayName, amount) {
  const collected = new Map(); // Use Map to deduplicate by question text
  let attempts = 0;

  // Retry loop: Keep fetching until we have enough unique questions or exhaust attempts
  while (collected.size < amount && attempts < 12) {
    attempts += 1;

    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&type=multiple&category=${categoryId}`
    );
    const payload = await response.json();

    // OpenTDB rate limit detection: response_code 5 means "too many requests"
    if (payload.response_code === 5) {
      // Exponential backoff: start at 300ms, add 150ms per attempt, cap at 1500ms
      const backoff = Math.min(1500, 300 + attempts * 150);
      await sleep(backoff);
      continue;
    }

    // Empty response: Wait briefly and try again
    if (!payload.results?.length) {
      await sleep(150);
      continue;
    }

    // Process each question in the batch
    for (const item of payload.results) {
      const questionText = decodeText(item.question);

      // Skip duplicates (same question text already collected)
      if (collected.has(questionText)) continue;

      const correct = decodeText(item.correct_answer);
      const incorrect = item.incorrect_answers.map((ans) => decodeText(ans));

      // Store question in Map with all required fields
      collected.set(questionText, {
        category: displayName,
        difficulty: item.difficulty,
        question: questionText,
        correct,
        options: shuffle([correct, ...incorrect]),
      });

      // Stop processing this batch if we've hit our target
      if (collected.size >= amount) break;
    }
  }

  return Array.from(collected.values());
}
