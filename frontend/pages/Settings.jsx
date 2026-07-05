/**
 * Settings page — profile info, dark mode toggle, and API key display.
 *
 * Matches the spec's Settings section: Dark Mode, API Key, Profile.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Moon,
  Sun,
  KeyRound,
  LogOut,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Section wrapper for consistent card styling across the page.
 */
function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="feature-card"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 shrink-0">
          <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

/**
 * Settings page with profile, theme, and API key sections.
 */
function Settings() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  // Placeholder masked key — the real key lives server-side only (backend/.env)
  const maskedKey = "sk-••••••••••••••••••••••••";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(maskedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — fail silently, nothing to copy anyway
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your profile, appearance, and API configuration
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile section */}
        <SettingsSection
          icon={User}
          title="Profile"
          description="Your account information"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  {user?.name || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  {user?.email || "—"}
                </p>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Appearance section */}
        <SettingsSection
          icon={isDark ? Moon : Sun}
          title="Appearance"
          description="Switch between light and dark mode"
        >
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-white">
              {isDark ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
            <div
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isDark ? "bg-brand-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isDark ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </SettingsSection>

        {/* API Key section */}
        <SettingsSection
          icon={KeyRound}
          title="API Key"
          description="Your OpenAI API key is configured server-side and never exposed to the browser"
        >
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <code className="flex-1 text-sm font-mono text-slate-600 dark:text-slate-300 truncate">
              {maskedKey}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors shrink-0"
              aria-label="Copy masked key"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            To change it, update <code>OPENAI_API_KEY</code> in your backend's{" "}
            <code>.env</code> file.
          </p>
        </SettingsSection>

        {/* Danger zone */}
        <SettingsSection
          icon={LogOut}
          title="Session"
          description="Sign out of AccessAI on this device"
        >
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full p-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </SettingsSection>

        {/* Footer branding */}
        <div className="flex items-center justify-center gap-2 pt-4 text-xs text-slate-400 dark:text-slate-500">
          <Sparkles className="w-3.5 h-3.5" />
          AccessAI — Improve Access
        </div>
      </div>
    </div>
  );
}

export default Settings;