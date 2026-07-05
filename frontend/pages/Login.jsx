/**
 * Login page — monochrome Cursor-inspired auth.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    clearError();
    if (!email.trim() || !password) {
      setFormError("Please enter both email and password.");
      return;
    }
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch {
      /* handled in context */
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-canvas-dark">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-10">
          <Link to="/" className="text-xs font-semibold uppercase tracking-widest text-ink-inverse">
            AccessAI
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-inverse mt-6">Sign in</h1>
          <p className="text-sm text-neutral-500 mt-2">Continue to your account</p>
        </div>

        <div className="border border-surface-border-light rounded-xl p-6 bg-surface-card">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {displayError && (
              <div className="alert-error" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{displayError}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="input-field pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            No account?{" "}
            <Link to="/signup" className="text-ink-inverse underline underline-offset-2 hover:opacity-70">
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link to="/" className="text-sm text-neutral-500 hover:text-ink-inverse transition-colors">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
