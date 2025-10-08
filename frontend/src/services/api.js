/**
 * API Service Layer
 * 
 * Centralized service for all backend API calls.
 * This provides a consistent interface for making requests,
 * handles authentication, and makes it easy to switch between
 * development and production environments.
 * 
 * Benefits:
 * - DRY: No duplicate fetch logic across components
 * - Easy configuration: Change base URL in one place
 * - Consistent error handling
 * - Type safety: Clear function signatures
 * - Testing: Mock this module in tests
 */

const API_BASE = "http://localhost:3000/api";

/**
 * Fetch with authentication (using session cookies)
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
async function fetchWithAuth(endpoint, options = {}) {
  const baseOptions = {
    credentials: "include", // Use session cookies for authentication
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, baseOptions);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * API service object with methods for all backend endpoints
 */
export const api = {
  // ===========================
  // User Endpoints
  // ===========================

  /**
   * Get current user profile
   * @returns {Promise<{user: {id: number, username: string, email: string, avatarUrl: string}}>}
   */
  async getCurrentUser() {
    return fetchWithAuth("/users/me");
  },

  // ===========================
  // Question Endpoints
  // ===========================

  /**
   * Get all available categories
   * @returns {Promise<string[]>} - Array of category names
   */
  async getCategories() {
    const response = await fetch(`${API_BASE}/questions/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Get random questions from a category
   * @param {string} category - Category name
   * @param {number} count - Number of questions
   * @returns {Promise<Array>} - Array of question objects
   */
  async getRandomQuestions(category, count = 5) {
    return fetchWithAuth(`/questions/random/${encodeURIComponent(category)}/${count}`);
  },

  // ===========================
  // Match Endpoints
  // ===========================

  /**
   * Create a new match
   * @param {object} matchData - Match configuration
   * @param {string} matchData.title - Match title
   * @param {string} matchData.category - Category name
   * @param {string} matchData.difficulty - Difficulty level
   * @param {number} matchData.maxPlayers - Maximum players
   * @param {boolean} matchData.isPublic - Public/private visibility
   * @returns {Promise<object>} - Created match object with id
   */
  async createMatch(matchData) {
    return fetchWithAuth("/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(matchData),
    });
  },

  /**
   * Get match details by ID
   * @param {number|string} matchId - Match ID
   * @returns {Promise<object>} - Match object with questions and players
   */
  async getMatch(matchId) {
    return fetchWithAuth(`/matches/${matchId}`);
  },

  /**
   * Get all matches (with optional filters)
   * @param {object} filters - Optional filters
   * @param {string} filters.category - Filter by category
   * @param {string} filters.sort - Sort order ('asc' or 'desc')
   * @returns {Promise<Array>} - Array of match objects
   */
  async getMatches(filters = {}) {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const endpoint = queryString ? `/matches?${queryString}` : "/matches";
    return fetchWithAuth(endpoint);
  },

  /**
   * Join an existing match
   * @param {number|string} matchId - Match ID to join
   * @returns {Promise<object>} - Join confirmation
   */
  async joinMatch(matchId) {
    return fetchWithAuth(`/matches/${matchId}/join`, {
      method: "POST",
    });
  },
};

/**
 * Export API base URL for direct use if needed
 */
export { API_BASE };
