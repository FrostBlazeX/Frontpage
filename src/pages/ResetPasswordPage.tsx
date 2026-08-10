import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";

const inputClass =
  "w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

// Handles two distinct states on one route: requesting a reset email (no
// recovery session yet), and setting a new password (arrived via the emailed
// link, which Supabase's client exchanges for a temporary recovery session
// and announces via the PASSWORD_RECOVERY auth event).
function ResetPasswordPage() {
  const { requestPasswordReset, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"request" | "confirm">("request");

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("confirm");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleRequestSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await requestPasswordReset(email);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEmailSent(true);
  };

  const handleConfirmSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await updatePassword(newPassword);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPasswordUpdated(true);
  };

  if (passwordUpdated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-xl font-bold">Password updated</h1>
          <p className="mb-4 text-text-secondary">Your password has been changed.</p>
          <button
            type="button"
            onClick={() => navigate("/app")}
            className="rounded-md bg-accent px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (mode === "confirm") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="mb-6 text-center text-lg font-semibold">Set a new password</h1>
          <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-3">
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-text-secondary">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className={inputClass}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-md bg-accent px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? "Saving…" : "Set new password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-xl font-bold">Check your email</h1>
          <p className="text-text-secondary">
            If an account exists for <strong>{email}</strong>, we sent a link to reset your
            password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link to="/" className="text-xl font-bold text-text-primary">
            Frontpage
          </Link>
          <h1 className="mt-4 text-lg font-semibold">Reset your password</h1>
        </div>

        <form onSubmit={handleRequestSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-text-secondary">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-md bg-accent px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          <Link to="/signin" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
