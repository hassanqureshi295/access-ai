/**
 * History page — browse, search, and delete past chat conversations.
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
import { formatRelativeDate, formatTemplateLabel } from "../utils/helpers";

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
        <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-surface-border-light bg-surface-card shrink-0">
          <MessageSquare className="w-5 h-5 text-neutral-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink-inverse truncate">{item.title}</h3>
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
            {item.response_summary}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeDate(item.created_at)}
            </span>
            {item.template && (
              <span className="text-xs px-2 py-0.5 border border-surface-border-dark text-neutral-400 uppercase tracking-wider">
                {formatTemplateLabel(item.template)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          disabled={deleting === item.id}
          className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-surface-card opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shrink-0"
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

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="section-label mb-1">Archive</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-inverse mb-1">
          Chat History
        </h1>
        <p className="text-sm text-neutral-500">
          Browse and search your past conversations
        </p>
      </motion.div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, message, or summary..."
          className="input-field pl-10"
        />
      </div>

      {error && (
        <div className="alert-error mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500 mb-3" />
          <p className="text-sm text-neutral-500">Loading history...</p>
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-surface-border-dark bg-surface-card"
        >
          <div className="flex items-center justify-center w-16 h-16 mb-4 border border-surface-border-dark">
            <Inbox className="w-8 h-8 text-neutral-500" />
          </div>
          <h3 className="text-lg font-semibold text-ink-inverse mb-1">
            {searchQuery ? "No results found" : "No chat history yet"}
          </h3>
          <p className="text-sm text-neutral-500 max-w-sm">
            {searchQuery
              ? "Try a different search term."
              : "Start a conversation on the Dashboard to see your history here."}
          </p>
        </motion.div>
      )}

      {!loading && items.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-wider text-neutral-500 mb-4">
            {items.length} conversation{items.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
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
