/**
 * AccessAI API service layer.
 *
 * Central Axios client for all FastAPI backend communication.
 * In development, Vite proxies requests to http://127.0.0.1:8000.
 */
import axios from "axios";

/** localStorage key for JWT — must match AuthContext */
const TOKEN_KEY = "accessai-token";

/**
 * Base URL for API requests.
 * Empty string uses same origin (Vite dev proxy in development).
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/** Shared Axios instance */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

/**
 * Attach JWT token to outgoing requests when available.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Normalize error responses from FastAPI ErrorResponse envelope.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

/**
 * Check backend health status.
 * @returns {Promise<{ status: string, version: string, environment: string, openai_configured: boolean }>}
 */
export async function checkHealth() {
  const { data } = await api.get("/health");
  return data;
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/**
 * Log in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string, token_type: string, user: object }>}
 */
export async function loginUser(email, password) {
  const { data } = await api.post("/login", { email, password });
  return data;
}

/**
 * Register a new user account.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string, token_type: string, user: object }>}
 */
export async function signupUser(name, email, password) {
  const { data } = await api.post("/signup", { name, email, password });
  return data;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

/**
 * Send a message to the AI assistant.
 * @param {string} message - User prompt text
 * @param {string|null} template - Optional template key (e.g. 'scholarships')
 * @param {string|null} userId - Optional user ID for history association
 * @returns {Promise<object>} ChatResponse with summary, recommendations, links, action plan
 */
export async function sendChatMessage(message, template = null, userId = null) {
  const payload = { message };
  if (template) payload.template = template;
  if (userId) payload.user_id = userId;

  const { data } = await api.post("/chat", payload);
  return data;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/**
 * Fetch chat history with optional search and user filter.
 * @param {string|null} query - Search term
 * @param {string|null} userId - Filter by user ID
 * @returns {Promise<{ items: Array, total: number }>}
 */
export async function getHistory(query = null, userId = null) {
  const params = {};
  if (query) params.query = query;
  if (userId) params.user_id = userId;

  const { data } = await api.get("/history", { params });
  return data;
}

/**
 * Delete a chat history entry by ID.
 * @param {string} entryId
 * @returns {Promise<{ success: boolean, message: string, deleted_id: string }>}
 */
export async function deleteHistoryEntry(entryId) {
  const { data } = await api.delete(`/history/${entryId}`);
  return data;
}

export default api;
