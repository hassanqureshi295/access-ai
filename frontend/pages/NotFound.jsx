/**
 * NotFound — 404 fallback page for unmatched routes.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Home, ArrowLeft } from "lucide-react";

/**
 * Full-screen 404 page with a link back to the landing page.
 */
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-surface-muted dark:bg-surface-dark">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-brand shadow-glow">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-7xl font-extrabold text-gradient mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
          Page not found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFound;