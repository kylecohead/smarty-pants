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
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
const getToken = () => {
  return localStorage.getItem("accessToken");
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., "/users/me")
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON response
 * @throws {Error} - If response is not ok
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.error || `Request failed: ${response.status}`
    );
  }

  return response.json();
};

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

  /**
   * Increment games played for a user once a match ends
   * @param {number} userId  - user ID
   * @returns {Promise<object>} - Updated user object
   */
  incrementGamesPlayed: async (userId) => {
    const response = await fetch(`/api/users/${userId}/increment-games`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to update games played');
    return response.json();
  },

  /**
   * Increment wins count for a user once they win a match
   * @param {number} userId - user ID
   * @returns {Promise<object>} - Updated user object
   */
  incrementUserWins: async (userId) => {
    const response = await fetch(`/api/users/${userId}/increment-wins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to update wins count');
    return response.json();
  },

  updateHighScore: async (userId, newScore) => {
    const response = await fetch(`/api/users/${userId}/update-highscore`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ highScore: newScore })
    });
    if (!response.ok) throw new Error('Failed to update high score');
    return response.json();
  }
};


/**
 * Export API base URL for direct use if needed
 */
export { API_BASE };
