/**
 * Dashboard page — AI assistant chat interface.
 *
 * Features: suggested prompts, template categories, chat messages,
 * structured AI responses (summary, recommendations, links, action plan).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sendChatMessage } from "../services/api";
import {
  getAllTemplates,
  getSuggestedPrompts,
  getTemplateByKey,
} from "../utils/prompts";

/** Prompt templates and suggested prompts from shared utils */
const TEMPLATES = getAllTemplates();
const SUGGESTED_PROMPTS = getSuggestedPrompts();

/**
 * Renders structured sections from a ChatResponse object.
 */
function StructuredResponse({ response }) {
  const sectionClass = "p-4 rounded-xl border border-surface-border-dark bg-surface-raised-dark";
  const headingClass = "flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-400 mb-3";

  return (
    <div className="space-y-3">
      <div className={sectionClass}>
        <h3 className={headingClass}>Summary</h3>
        <p className="text-sm text-neutral-300 leading-relaxed">{response.summary}</p>
      </div>

      {response.recommendations?.length > 0 && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Recommendations</h3>
          <ul className="space-y-2">
            {response.recommendations.map((item, index) => (
              <li key={index} className="flex gap-2 text-sm text-neutral-400">
                <span className="text-neutral-600 shrink-0">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {response.useful_links?.length > 0 && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Useful Links</h3>
          <ul className="space-y-2">
            {response.useful_links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-ink-inverse underline underline-offset-2 hover:opacity-70"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    <strong>{link.title}</strong>
                    {link.description && <span className="text-neutral-500"> — {link.description}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {response.action_plan?.length > 0 && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Action Plan</h3>
          <ol className="space-y-2 list-decimal list-inside text-sm text-neutral-400">
            {response.action_plan.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/**
 * Single chat message bubble (user or assistant).
 */
function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div       className={`max-w-[85%] lg:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-white text-black"
            : "border border-surface-border-dark bg-surface-card"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : message.structured ? (
          <StructuredResponse response={message.structured} />
        ) : (
          <div className="chat-markdown text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Main dashboard with AI chat interface.
 */
function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleSend = async (text = input) => {
    const messageText = text.trim();
    if (!messageText || loading) return;

    setError(null);
    setInput("");

    const userMessage = { role: "user", content: messageText, id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await sendChatMessage(
        messageText,
        selectedTemplate,
        user?.id || null
      );

      const assistantMessage = {
        role: "assistant",
        content: response.markdown,
        structured: response,
        id: response.id,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message || "Failed to get AI response. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const showWelcome = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 border-b border-surface-border-dark">
        <p className="section-label mb-1">Assistant</p>
        <h1 className="text-lg font-semibold tracking-tight text-ink-inverse">AI Assistant</h1>
        <p className="text-sm text-neutral-500 mt-1">Scholarships, careers, roadmaps, and more</p>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-ink-inverse mb-2">
              How can I help you today?
            </h2>
            <p className="text-neutral-500 mb-8 text-sm">
              Choose a category or try a suggested prompt
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {TEMPLATES.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() =>
                    setSelectedTemplate(
                      selectedTemplate === template.key ? null : template.key
                    )
                  }
                  className={`chip ${
                    selectedTemplate === template.key ? "chip-active" : ""
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="prompt-card"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="rounded-2xl border border-surface-border-dark bg-surface-card px-4 py-3 flex items-center gap-2 text-sm text-neutral-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="shrink-0 mx-6 mb-2 alert-error">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="shrink-0 p-4 sm:px-6 border-t border-surface-border-dark bg-black">
        {selectedTemplate && (
          <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Category</span>
            <span className="chip chip-active text-[10px] py-0.5 px-2">
              {getTemplateByKey(selectedTemplate)?.label}
            </span>
            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        <div className="chat-bar max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about scholarships, internships, careers..."
            rows={1}
            disabled={loading}
            className="chat-input"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-icon"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
