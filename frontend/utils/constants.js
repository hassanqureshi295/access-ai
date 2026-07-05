/**
 * Shared application constants for the AccessAI frontend.
 *
 * Centralizes storage keys, route paths, and branding strings
 * used across multiple components and contexts.
 */

/** Application branding */
export const APP_NAME = "AccessAI";
export const APP_TAGLINE = "Improve Access";
export const APP_DESCRIPTION =
  "AI-powered assistant helping students discover scholarships, internships, careers, and learning roadmaps.";

/** localStorage keys — must stay in sync across contexts */
export const STORAGE_KEYS = {
  TOKEN: "accessai-token",
  USER: "accessai-user",
  THEME: "accessai-theme",
};

/** Client-side route paths */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  HISTORY: "/history",
  SETTINGS: "/settings",
};

/** API request timeout in milliseconds (matches api.js) */
export const API_TIMEOUT_MS = 60000;

/** Default API base URL — empty uses Vite dev proxy */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";
