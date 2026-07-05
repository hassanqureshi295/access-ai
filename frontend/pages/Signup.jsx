/**
 * Signup page — monochrome Cursor-inspired auth.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const { signup, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    clearError();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setFormError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!trimmedEmail) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    try {
      await signup(trimmedName, trimmedEmail, password);
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
          <h1 className="text-2xl font-semibold tracking-tight text-ink-inverse mt-6">Create account</h1>
          <p className="text-sm text-neutral-500 mt-2">Start discovering opportunities</p>
        </div>

        <div className="border border-surface-border-light rounded-xl p-6 bg-surface-card">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {displayError && (
              <div className="alert-error" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{displayError}</p>
              </div>
            )}

            {[
              { id: "name", label: "Name", type: "text", icon: User, value: name, set: setName, auto: "name", ph: "Alex Johnson" },
              { id: "email", label: "Email", type: "email", icon: Mail, value: email, set: setEmail, auto: "email", ph: "you@university.edu" },
              { id: "password", label: "Password", type: "password", icon: Lock, value: password, set: setPassword, auto: "new-password", ph: "Min. 6 characters" },
              { id: "confirmPassword", label: "Confirm", type: "password", icon: Lock, value: confirmPassword, set: setConfirmPassword, auto: "new-password", ph: "Repeat password" },
            ].map(({ id, label, type, icon: Icon, value, set, auto, ph }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                  {label}
                </label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    id={id}
                    type={type}
                    autoComplete={auto}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={ph}
                    className="input-field pl-10"
                    disabled={loading}
                    required
                    minLength={id.includes("password") ? 6 : id === "name" ? 2 : undefined}
                  />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Have an account?{" "}
            <Link to="/login" className="text-ink-inverse underline underline-offset-2 hover:opacity-70">
              Sign in
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

export default Signup;
