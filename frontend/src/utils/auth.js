// Utility functions for authenticated API requests with session cookies

/**
 * Make an authenticated fetch request with session cookies
 * @param {string} url - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  const defaultOptions = {
    credentials: "include", // Always include cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
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
    
    return null;
  } catch (error) {
    console.error("Auth check failed:", error);
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

  return response.json();
}