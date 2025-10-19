import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  refreshToken,
  clearTokens,
  logout,
} from "../utils/auth.js";

// Helper function to decode JWT and get expiration
const decodeTokenExpiration = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch (e) {
    return null;
  }
};

// Helper function to format time until expiration
const formatTimeUntilExpiration = (expDate) => {
  if (!expDate) return "Unknown";
  const now = new Date();
  const diffMs = expDate - now;
  if (diffMs <= 0) return "EXPIRED";

  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

// Create the auth context
const AuthContext = createContext(null);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to log token status
  const logTokenStatus = (context = "") => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const accessExp = decodeTokenExpiration(accessToken);
    const refreshExp = decodeTokenExpiration(refreshToken);

    console.group(` Token Status ${context}`);
    console.log(
      `Access Token: ${
        accessToken ? accessToken.substring(0, 20) + "..." : "NONE"
      }`
    );
    console.log(
      `Access Expires: ${
        accessExp ? accessExp.toLocaleString() : "Unknown"
      } (${formatTimeUntilExpiration(accessExp)})`
    );
    console.log(
      `Refresh Token: ${
        refreshToken ? refreshToken.substring(0, 20) + "..." : "NONE"
      }`
    );
    console.log(
      `Refresh Expires: ${
        refreshExp ? refreshExp.toLocaleString() : "Unknown"
      } (${formatTimeUntilExpiration(refreshExp)})`
    );
    console.log(`Is Authenticated: ${isAuthenticated()}`);
    console.groupEnd();
  };

  // Function to fetch current user data
  const fetchCurrentUser = async () => {
    console.log(" AuthContext: Fetching current user...");
    logTokenStatus("(before fetch)");

    try {
      if (!isAuthenticated()) {
        console.log(" AuthContext: Not authenticated, clearing state");
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(" AuthContext: Successfully fetched user data");
        setUser(data.user);
        setIsLoggedIn(true);
      } else if (response.status === 401) {
        console.log(
          "⏳ AuthContext: Access token expired (401), attempting refresh..."
        );
        // Try to refresh token
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          console.log(
            " AuthContext: Token refresh successful, retrying user fetch..."
          );
          logTokenStatus("(after refresh)");
          // Retry fetching user
          await fetchCurrentUser();
          return;
        } else {
          console.log(
            " AuthContext: Token refresh failed, clearing auth state"
          );
          // Refresh failed, clear auth state
          clearAuthState();
        }
      } else {
        console.log(
          ` AuthContext: Unexpected response status ${response.status}, clearing auth state`
        );
        clearAuthState();
      }
    } catch (error) {
      console.error(" AuthContext: Failed to fetch current user:", error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  // Function to clear auth state
  const clearAuthState = () => {
    console.log("AuthContext: Clearing auth state");
    setUser(null);
    setIsLoggedIn(false);
    clearTokens();
  };

  // Function to handle login success
  const handleLoginSuccess = (userData) => {
    console.log(
      " AuthContext: Login success for user:",
      userData.username || userData.id
    );
    logTokenStatus("(after login)");
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Function to handle logout
  const handleLogout = (reason = "manual") => {
    console.log(` AuthContext: Logout triggered (reason: ${reason})`);
    clearAuthState();
    logout(reason);
  };

  // Check authentication status on mount and token changes
  useEffect(() => {
    console.log(" AuthContext: Initializing auth system...");
    fetchCurrentUser();

    // Listen for localStorage changes (when tokens are stored)
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" || e.key === "refreshToken") {
        console.log(
          " AuthContext: Token storage detected, refreshing user data..."
        );
        fetchCurrentUser();
      }
    };

    // Listen for manual storage events (same window)
    const handleManualStorageChange = () => {
      console.log(
        " AuthContext: Manual token storage detected, refreshing user data..."
      );
      fetchCurrentUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tokenStored", handleManualStorageChange);

    // Set up interval to check token validity and log status
    const interval = setInterval(() => {
      console.log(" AuthContext: Periodic token check...");
      logTokenStatus("(periodic check)");

      if (isAuthenticated()) {
        const accessToken = getAccessToken();
        const accessExp = decodeTokenExpiration(accessToken);
        const now = new Date();
        const timeUntilExpiry = accessExp ? accessExp - now : 0;

        // Warn if token expires soon (within 2 minutes)
        if (timeUntilExpiry > 0 && timeUntilExpiry < 2 * 60 * 1000) {
          console.warn(
            ` AuthContext: Access token expires soon! (${formatTimeUntilExpiration(
              accessExp
            )})`
          );
        }

        // Check if token is already expired - try to refresh first
        if (timeUntilExpiry <= 0) {
          console.error(
            " AuthContext: Access token has expired! Attempting refresh..."
          );
          (async () => {
            try {
              const refreshSuccess = await refreshToken();
              if (refreshSuccess) {
                console.log(
                  " AuthContext: Successfully refreshed expired token"
                );
                logTokenStatus("(after periodic refresh)");
              } else {
                console.error(
                  " AuthContext: Failed to refresh expired token, clearing auth state"
                );
                clearAuthState();
              }
            } catch (error) {
              console.error(" AuthContext: Error during token refresh:", error);
              clearAuthState();
            }
          })();
        }
      } else if (isLoggedIn) {
        // User was logged in but token is gone - clear state
        console.log(
          " AuthContext: User was logged in but no valid token found, clearing state"
        );
        clearAuthState();
      }
    }, 5000); // Check every 5 seconds for more responsive expiration detection

    return () => {
      console.log(" AuthContext: Cleaning up auth system...");
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tokenStored", handleManualStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Function to validate current authentication status (synchronous, for quick checks)
  const validateAuthStatus = () => {
    console.log(" AuthContext: Validating current auth status (sync)...");

    if (!isAuthenticated()) {
      console.log(" AuthContext: No valid token found during validation");
      if (isLoggedIn) {
        console.log(" AuthContext: Clearing stale auth state");
        clearAuthState();
      }
      return false;
    }

    const token = getAccessToken();
    const expiration = decodeTokenExpiration(token);
    const now = new Date();
    const timeUntilExpiry = expiration ? expiration - now : 0;

    // For sync validation, just check if token exists and isn't expired
    if (timeUntilExpiry <= 0) {
      console.warn(
        " AuthContext: Token expired during sync validation (will attempt refresh elsewhere)"
      );
      return false;
    }

    console.log(
      ` AuthContext: Auth status valid (expires in ${formatTimeUntilExpiration(
        expiration
      )})`
    );
    return true;
  };

  // Function to validate and refresh authentication (async, attempts refresh if needed)
  const validateAndRefreshAuth = async () => {
    console.log(
      "AuthContext: Validating and refreshing auth status (async)..."
    );

    if (!isAuthenticated()) {
      console.log(" AuthContext: No valid token found during async validation");
      if (isLoggedIn) {
        console.log(" AuthContext: Clearing stale auth state");
        clearAuthState();
      }
      return false;
    }

    const token = getAccessToken();
    const expiration = decodeTokenExpiration(token);
    const now = new Date();
    const timeUntilExpiry = expiration ? expiration - now : 0;

    if (timeUntilExpiry <= 0) {
      console.error(
        " AuthContext: Token expired during async validation, attempting refresh..."
      );
      try {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          console.log(
            " AuthContext: Successfully refreshed expired token during validation"
          );
          logTokenStatus("(after validation refresh)");
          return true;
        } else {
          console.error(
            " AuthContext: Failed to refresh expired token during validation"
          );
          clearAuthState();
          return false;
        }
      } catch (error) {
        console.error(
          " AuthContext: Error during token refresh in validation:",
          error
        );
        clearAuthState();
        return false;
      }
    }

    console.log(
      ` AuthContext: Auth status valid (expires in ${formatTimeUntilExpiration(
        expiration
      )})`
    );
    return true;
  };

  // Function to get fresh access token (with auto-refresh)
  const getValidAccessToken = async () => {
    console.log(" AuthContext: Getting valid access token...");

    // First validate current auth status
    if (!validateAuthStatus()) {
      return null;
    }

    const token = getAccessToken();
    const expiration = decodeTokenExpiration(token);
    console.log(
      ` AuthContext: Returning access token (expires: ${formatTimeUntilExpiration(
        expiration
      )})`
    );

    // If we have a token, return it (authenticatedFetch will handle refresh if needed)
    return token;
  };

  const contextValue = {
    user,
    loading,
    isLoggedIn,
    isAuthenticated: isLoggedIn,
    handleLoginSuccess,
    handleLogout,
    refreshUser: fetchCurrentUser,
    getValidAccessToken,
    validateAuthStatus,
    validateAndRefreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
