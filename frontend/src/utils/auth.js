// Utility functions for JWT token authentication

/**
 * Get access token from localStorage
 * @returns {string|null} - Access token or null if not found
 */
export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

/**
 * Get refresh token from localStorage
 * @returns {string|null} - Refresh token or null if not found
 */
export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

/**
 * Store tokens in localStorage
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 */
export function storeTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

/**
 * Clear tokens from localStorage
 */
export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/**
 * Make an authenticated fetch request with JWT token
 * @param {string} url - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  const token = getAccessToken();
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
}

/**
 * Refresh access token using refresh token
 * @returns {Promise<boolean>} - True if refresh successful, false otherwise
 */
export async function refreshToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      return true;
    }
    
    // Refresh failed, clear tokens
    clearTokens();
    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearTokens();
    return false;
  }
}

/**
 * Login user with credentials
 * @param {string} identifier - Username or email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Login response
 */
export async function login(identifier, password) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Login failed:", data);
      return { success: false, error: data.error || "Login failed" };
    }
    
    // Store tokens
    storeTokens(data.accessToken, data.refreshToken);
    
    return { success: true, user: data.user, role: data.role };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Network error during login" };
  }
}

/**
 * Sign up new user
 * @param {string} username - Username
 * @param {string} email - Email address
 * @param {string} password - User password
 * @returns {Promise<Object>} - Signup response
 */
export async function signup(username, email, password) {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Signup failed:", data);
      return { success: false, error: data.error || "Signup failed" };
    }
    
    // Store tokens
    storeTokens(data.accessToken, data.refreshToken);
    
    return { success: true, user: data.user, role: data.role };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Network error during signup" };
  }
}

/**
 * Logout current user
 */
export function logout() {
  clearTokens();
  window.location.href = "/";
}

/**
 * Check if user is currently authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
export function isAuthenticated() {
  return !!getAccessToken();
}