// Utility functions for authenticated API requests with session cookies

const API_BASE = "http://localhost:3000";

/**
 * Make an authenticated fetch request with session cookies
 * @param {string} url - The API endpoint (will be prefixed with API_BASE if not already absolute)
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  // Add API_BASE if url doesn't already start with http
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  
  const defaultOptions = {
    credentials: "include", // Always include cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  return fetch(fullUrl, { ...defaultOptions, ...options });
}

/**
 * Check if user is currently authenticated
 * @returns {Promise<Object|null>} - User object if authenticated, null otherwise
 */
export async function checkAuth() {
  try {
    const response = await authenticatedFetch("/api/auth/me");
    
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    
    // 401 is expected when not logged in, don't log as error
    if (response.status === 401) {
      return null;
    }
    
    return null;
  } catch (error) {
    // Only log unexpected errors, not 401s
    if (!error.message?.includes("401")) {
      console.error("Auth check failed:", error);
    }
    return null;
  }
}

/**
 * Login user with credentials
 * @param {string} identifier - Username or email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to extend session duration
 * @returns {Promise<Object>} - Login response
 */
export async function login(identifier, password, rememberMe = false) {
  try {
    const response = await authenticatedFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password, rememberMe }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Login failed:", data);
      return { success: false, error: data.error || "Login failed" };
    }
    
    // Save JWT token to localStorage for Socket.IO authentication
    if (data.token) {
      localStorage.setItem("accessToken", data.token);
    }
    
    return data;
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
    const response = await authenticatedFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Signup failed:", data);
      return { success: false, error: data.error || "Signup failed" };
    }
    
    // Save JWT token to localStorage for Socket.IO authentication
    if (data.token) {
      localStorage.setItem("accessToken", data.token);
    }
    
    return data;
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Network error during signup" };
  }
}

/**
 * Logout current user
 * @returns {Promise<Object>} - Logout response
 */
export async function logout() {
  const response = await authenticatedFetch("/api/auth/logout", {
    method: "POST",
  });

  // Clear JWT token from localStorage
  localStorage.removeItem("accessToken");

  return response.json();
}