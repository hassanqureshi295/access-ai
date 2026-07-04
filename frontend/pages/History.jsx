/**
 * History page — browse, search, and delete past chat conversations.
 *
 * Fetches history from GET /history and supports search filtering
 * and deletion via DELETE /history/{id}.
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  MessageSquare,
  Loader2,
  AlertCircle,
  Inbox,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { deleteHistoryEntry, getHistory } from "../services/api";

/**
 * Format an ISO date string for display.
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Single history list item card.
 */
function HistoryCard({ item, onDelete, deleting }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="feature-card group"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 shrink-0">
          <MessageSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
            {item.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
            {item.response_summary}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(item.created_at)}
            </span>
            {item.template && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 capitalize">
                {item.template.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          disabled={deleting === item.id}
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shrink-0"
          aria-label={`Delete chat: ${item.title}`}
        >
          {deleting === item.id ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Chat history page with search and delete.
 */
function History() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { user } = useAuth();

  const fetchHistory = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(query || null, user?.id || null);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || "Failed to load chat history.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchHistory]);

  const handleDelete = async (entryId) => {
    if (!window.confirm("Delete this chat from history?")) return;

    setDeleting(entryId);
    try {
      await deleteHistoryEntry(entryId);
      setItems((prev) => prev.filter((item) => item.id !== entryId));
    } catch (err) {
      setError(err.message || "Failed to delete chat.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Chat History
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Browse and search your past conversations with AccessAI
        </p>
      </motion.div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, message, or summary..."
          className="input-field pl-12"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Loading history...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
            {searchQuery ? "No results found" : "No chat history yet"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            {searchQuery
              ? "Try a different search term."
              : "Start a conversation on the Dashboard to see your history here."}
          </p>
        </motion.div>
      )}

      {/* History list */}
      {!loading && items.length > 0 && (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {items.length} conversation{items.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  deleting={deleting}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

export default History;
