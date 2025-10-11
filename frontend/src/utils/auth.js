// Utility functions for JWT token authentication

// Prevent concurrent refresh attempts
let refreshPromise = null;

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
  console.log("💾 Storing new tokens in localStorage");
  console.log(`   Access Token: ${accessToken?.substring(0, 20)}...`);
  console.log(`   Refresh Token: ${refreshToken?.substring(0, 20)}...`);
  
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

/**
 * Clear tokens from localStorage
 */
export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  console.log("🗑️ Cleared tokens from localStorage");
}

/**
 * Make an authenticated fetch request with JWT token
 * Automatically attempts token refresh on 401 errors
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

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  // If we get a 401 (Unauthorized), try to refresh the token
  if (response.status === 401 && token) {
    const requestId = Math.random().toString(36).substr(2, 6);
    console.log(`🔄 Request ${requestId} to ${url}: Access token expired, attempting refresh...`);
    
    const refreshSuccess = await refreshToken();
    if (refreshSuccess) {
      console.log(`✅ Request ${requestId}: Token refreshed successfully, retrying request...`);
      
      // Retry the request with the new token
      const newToken = getAccessToken();
      const retryOptions = {
        ...defaultOptions,
        headers: {
          ...defaultOptions.headers,
          Authorization: `Bearer ${newToken}`,
        },
      };
      
      return fetch(url, { ...retryOptions, ...options });
    } else {
      console.log(`❌ Request ${requestId}: Token refresh failed - user will be redirected to home`);
      // Note: refreshToken() function already handles clearing tokens and redirect
      // Just return the original 401 response
      return response;
    }
  }
  
  return response;
}

/**
 * Refresh access token using refresh token
 * @returns {Promise<boolean>} - True if refresh successful, false otherwise
 */
export async function refreshToken() {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    console.log("⏳ Refresh already in progress, waiting for result...");
    return await refreshPromise;
  }

  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    console.log("❌ No refresh token available");
    return false;
  }

  const refreshId = Math.random().toString(36).substr(2, 9);
  console.log(`🔄 Starting refresh process... (ID: ${refreshId})`);

  // Create the refresh promise
  refreshPromise = performRefresh(currentRefreshToken, refreshId);
  
  try {
    const result = await refreshPromise;
    return result;
  } finally {
    // Clear the promise when done
    refreshPromise = null;
  }
}

/**
 * Internal function to perform the actual refresh
 */
async function performRefresh(currentRefreshToken, refreshId) {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: currentRefreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      const oldToken = getAccessToken();
      localStorage.setItem("accessToken", data.accessToken);
      
      console.log(`✅ Token refreshed successfully (ID: ${refreshId})`);
      console.log("Old token:", oldToken?.substring(0, 20) + "...");
      console.log("New token:", data.accessToken?.substring(0, 20) + "...");
      
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ Token refresh failed (ID: ${refreshId}):`, response.status, errorData);
      
      // Check if refresh token is expired or invalid
      if (response.status === 403 || response.status === 401) {
        console.log(`🔒 Refresh token expired/invalid (ID: ${refreshId}) - logging out`);
        handleExpiredRefreshToken();
        return false;
      }
    }
    
    // Other refresh failures, clear tokens but don't redirect yet
    clearTokens();
    return false;
  } catch (error) {
    console.error(`❌ Token refresh error (ID: ${refreshId}):`, error);
    console.log(`🔒 Network error during refresh (ID: ${refreshId}) - logging out`);
    logout("network_error_during_refresh");
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
    console.log("🔑 LOGIN successful - storing tokens");
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
    console.log("🎉 SIGNUP successful - storing tokens");
    storeTokens(data.accessToken, data.refreshToken);
    
    return { success: true, user: data.user, role: data.role };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Network error during signup" };
  }
}

/**
 * Logout current user
 * @param {string} reason - Optional reason for logout
 */
export function logout(reason = "manual") {
  console.log(`🚪 Logging out user (reason: ${reason})`);
  clearTokens();
  window.location.href = "/";
}

/**
 * Handle expired refresh token - logs out user and redirects to home
 */
export function handleExpiredRefreshToken() {
  console.log("🔒 Refresh token expired - logging out user");
  logout("refresh_token_expired");
}

/**
 * Check if user is currently authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
export function isAuthenticated() {
  return !!getAccessToken();
}