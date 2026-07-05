/**
 * TailwindCSS — Cursor-inspired monochrome theme.
 * ~80% black / ~20% white accents. Rounded, flat, no glow.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx}",
    "./App.jsx",
    "./main.jsx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#ffffff",
          dark: "#000000",
        },
        surface: {
          DEFAULT: "#fafafa",
          dark: "#0a0a0a",
          raised: "#f5f5f5",
          "raised-dark": "#141414",
          card: "#111111",
          border: "#e5e5e5",
          "border-dark": "#333333",
          "border-light": "#525252",
        },
        ink: {
          DEFAULT: "#000000",
          muted: "#737373",
          faint: "#a3a3a3",
          inverse: "#ffffff",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      letterSpacing: {
        tight: "-0.02em",
        snug: "-0.01em",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "fade-in-up": "fadeInUp 0.45s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
