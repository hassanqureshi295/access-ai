/**
 * AccessAI React application entry point.
 *
 * Mounts the root component inside React Router and applies
 * the saved theme before the first render to prevent flash.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

/** localStorage key for dark mode preference */
const THEME_STORAGE_KEY = "accessai-theme";

/**
 * Apply dark or light mode class on <html> before React renders.
 * Reads saved preference, then falls back to system preference.
 */
function initializeTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = saved === "dark" || (saved !== "light" && prefersDark);

  document.documentElement.classList.toggle("dark", isDark);
}

initializeTheme();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
