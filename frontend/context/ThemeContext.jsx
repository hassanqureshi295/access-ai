/**
 * Theme context for AccessAI dark mode.
 *
 * Persists user preference to localStorage and syncs the `dark` class
 * on <html> for Tailwind dark mode variants.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";

/** localStorage key — must match main.jsx */
const THEME_STORAGE_KEY = "accessai-theme";

const ThemeContext = createContext(null);

/**
 * Read initial theme from localStorage or system preference.
 * @returns {boolean} True if dark mode should be active.
 */
function getInitialDarkMode() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Apply or remove the `dark` class on the document root element.
 * @param {boolean} isDark
 */
function applyThemeClass(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
}

/**
 * Provides theme state and toggle to the component tree.
 */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(getInitialDarkMode);

  // Sync <html> class whenever theme changes
  useEffect(() => {
    applyThemeClass(isDark);
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  /** Flip between light and dark mode */
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  /** Set theme explicitly */
  const setTheme = useCallback((dark) => {
    setIsDark(Boolean(dark));
  }, []);

  const value = {
    isDark,
    theme: isDark ? "dark" : "light",
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Access theme state and controls from any component.
 * @returns {{ isDark: boolean, theme: string, toggleTheme: Function, setTheme: Function }}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
