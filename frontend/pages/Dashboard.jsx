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
  Sparkles,
  User,
  ExternalLink,
  Lightbulb,
  ListChecks,
  Link2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sendChatMessage } from "../services/api";

/** Suggested starter prompts — mirrors backend prompt.py */
const SUGGESTED_PROMPTS = [
  "I want scholarships in Germany for a Master's in Computer Science",
  "I am a CS student in Pakistan — what opportunities should I explore?",
  "Suggest an AI and machine learning roadmap for beginners",
  "What skills should I learn to become a full-stack developer?",
];

/** Prompt template categories */
const TEMPLATES = [
  { key: "scholarships", label: "Scholarships" },
  { key: "internships", label: "Internships" },
  { key: "career_advice", label: "Career Advice" },
  { key: "learning_roadmap", label: "Learning Roadmap" },
  { key: "resume_tips", label: "Resume Tips" },
  { key: "interview_questions", label: "Interview Prep" },
  { key: "freelancing", label: "Freelancing" },
  { key: "hackathons", label: "Hackathons" },
];

/**
 * Renders structured sections from a ChatResponse object.
 */
function StructuredResponse({ response }) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="p-4 rounded-2xl bg-brand-50/80 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300 mb-2">
          <Sparkles className="w-4 h-4" />
          Summary
        </h3>
        <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
          {response.summary}
        </p>
      </div>

      {/* Recommendations */}
      {response.recommendations?.length > 0 && (
        <div className="p-4 rounded-2xl glass">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {response.recommendations.map((item, index) => (
              <li key={index} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="text-brand-500 font-bold shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Useful Links */}
      {response.useful_links?.length > 0 && (
        <div className="p-4 rounded-2xl glass">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
            <Link2 className="w-4 h-4 text-brand-500" />
            Useful Links
          </h3>
          <ul className="space-y-2">
            {response.useful_links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 group"
                >
                  <ExternalLink className="w-4 h-4 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                  <span>
                    <strong>{link.title}</strong>
                    {link.description && (
                      <span className="text-slate-500 dark:text-slate-400"> — {link.description}</span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Plan */}
      {response.action_plan?.length > 0 && (
        <div className="p-4 rounded-2xl glass">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
            <ListChecks className="w-4 h-4 text-green-500" />
            Action Plan
          </h3>
          <ol className="space-y-2 list-decimal list-inside">
            {response.action_plan.map((step, index) => (
              <li key={index} className="text-sm text-slate-600 dark:text-slate-300 pl-1">
                {step}
              </li>
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
      <div
        className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
          isUser
            ? "bg-brand-100 dark:bg-brand-900/40"
            : "bg-gradient-brand shadow-glow"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>

      <div
        className={`max-w-[85%] lg:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-brand-600 text-white"
            : "glass"
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
      <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60 glass">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          AI Assistant
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ask about scholarships, careers, roadmaps, and more
        </p>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-brand shadow-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              How can I help you today?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Choose a category or try a suggested prompt below
            </p>

            {/* Template chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {TEMPLATES.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() =>
                    setSelectedTemplate(
                      selectedTemplate === template.key ? null : template.key
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTemplate === template.key
                      ? "bg-brand-600 text-white shadow-glow"
                      : "glass hover:shadow-card text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>

            {/* Suggested prompts */}
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="text-left p-4 rounded-2xl glass hover:shadow-card-hover hover:-translate-y-0.5 transition-all text-sm text-slate-700 dark:text-slate-300"
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-brand shadow-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  AccessAI is thinking...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="shrink-0 mx-4 sm:mx-6 mb-2 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 p-4 sm:px-6 border-t border-slate-200/60 dark:border-slate-700/60 glass">
        {selectedTemplate && (
          <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Category:</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              {TEMPLATES.find((t) => t.key === selectedTemplate)?.label}
            </span>
            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              Clear
            </button>
          </div>
        )}

        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about scholarships, internships, careers..."
            rows={1}
            disabled={loading}
            className="input-field flex-1 resize-none min-h-[48px] max-h-32 py-3"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary px-4 shrink-0"
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
