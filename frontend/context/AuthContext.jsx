/**
 * Authentication context for AccessAI.
 *
 * Manages user session state, JWT token storage, and
 * login/signup/logout actions via the API service.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loginUser, signupUser } from "../services/api";

/** localStorage keys for persisted session */
const TOKEN_KEY = "accessai-token";
const USER_KEY = "accessai-user";

const AuthContext = createContext(null);

/**
 * Load saved user profile from localStorage.
 * @returns {object|null}
 */
function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Provides authentication state and actions to the component tree.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(token && user);

  /**
   * Persist token and user profile to state and localStorage.
   */
  const persistSession = useCallback((accessToken, userProfile) => {
    setToken(accessToken);
    setUser(userProfile);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
  }, []);

  /**
   * Clear session from state and localStorage.
   */
  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  /** Log in with email and password */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      persistSession(data.access_token, data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  /** Register a new account */
  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signupUser(name, email, password);
      persistSession(data.access_token, data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Signup failed.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  /** Log out and clear session */
  const logout = useCallback(() => {
    clearSession();
    setError(null);
  }, [clearSession]);

  /** Clear error message */
  const clearError = useCallback(() => setError(null), []);

  // Re-sync state if localStorage changes in another tab
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === TOKEN_KEY) {
        setToken(event.newValue);
      }
      if (event.key === USER_KEY) {
        setUser(event.newValue ? JSON.parse(event.newValue) : null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Access auth state and actions from any component.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
