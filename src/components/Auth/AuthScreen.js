import React, { useState } from "react";
import { DEMO_ACCOUNT, VIEWER_ACCOUNT } from "hooks/useAuth";
import asset from "helpers/asset";
import "./AuthScreen.scss";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthSplash() {
  return (
    <div className="auth-splash" role="status" aria-live="polite">
      <img src={asset("images/logo.png")} alt="Interview Scheduler" />
    </div>
  );
}

export default function AuthScreen({ onLogin, onRegister, onDemo, onViewerDemo }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("viewer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setPassword("");
    setConfirm("");
  };

  const validate = () => {
    if (isRegister && !name.trim()) {
      return "Enter your name.";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      return "Enter a valid email address.";
    }
    if (!password) {
      return "Enter your password.";
    }
    if (isRegister && password.length < 8) {
      return "Use a password with at least 8 characters.";
    }
    if (isRegister && password !== confirm) {
      return "Passwords do not match.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    setError("");
    const result = isRegister
      ? await onRegister({ name, email, password, role })
      : await onLogin(email, password);
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
    }
  };

  const handleDemo = async () => {
    setBusy(true);
    setError("");
    const result = await onDemo();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
    }
  };

  const handleViewerDemo = async () => {
    setBusy(true);
    setError("");
    const result = await onViewerDemo();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
    }
  };

  return (
    <main className="auth">
      <section className="auth__brand">
        <img
          className="auth__logo"
          src={asset("images/logo.png")}
          alt="Interview Scheduler"
        />
        <h1 className="auth__headline">Plan the week in minutes.</h1>
        <p className="auth__lede">
          Book, edit, and cancel interviews without the back-and-forth.
        </p>
        <ul className="auth__points">
          <li>See open spots for each day</li>
          <li>Match students with interviewers</li>
          <li>Keep your schedule in one place</li>
        </ul>
      </section>

      <section className="auth__panel">
        <form className="auth__card" onSubmit={handleSubmit} noValidate>
          <p className="auth__eyebrow">{isRegister ? "New here" : "Welcome back"}</p>
          <h2 className="auth__title">
            {isRegister ? "Create your account" : "Sign in"}
          </h2>
          <p className="auth__subtitle">
            {isRegister
              ? "Choose how you’ll use the scheduler, then add your details."
              : "Use your account, or try a demo."}
          </p>

          {isRegister && (
            <fieldset className="auth__roles">
              <legend>How will you use this?</legend>
              <label className={role === "viewer" ? "auth__role auth__role--selected" : "auth__role"}>
                <input
                  type="radio"
                  name="role"
                  value="viewer"
                  checked={role === "viewer"}
                  onChange={() => setRole("viewer")}
                />
                <span>
                  <strong>Check availability</strong>
                  See busy and open times. No names.
                </span>
              </label>
              <label className={role === "coordinator" ? "auth__role auth__role--selected" : "auth__role"}>
                <input
                  type="radio"
                  name="role"
                  value="coordinator"
                  checked={role === "coordinator"}
                  onChange={() => setRole("coordinator")}
                />
                <span>
                  <strong>Manage bookings</strong>
                  Book, edit, and cancel interviews.
                </span>
              </label>
            </fieldset>
          )}

          {isRegister && (
            <label className="auth__field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex Rivera"
              />
            </label>
          )}

          <label className="auth__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@studio.com"
            />
          </label>

          <label className="auth__field">
            <span>Password</span>
            <span className="auth__password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isRegister ? "At least 8 characters" : "Your password"}
              />
              <button
                type="button"
                className="auth__toggle"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>

          {isRegister && (
            <label className="auth__field">
              <span>Confirm password</span>
              <input
                type={showPassword ? "text" : "password"}
                name="confirm"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Repeat password"
              />
            </label>
          )}

          {error && (
            <p className="auth__error" role="alert">
              {error}
            </p>
          )}

          <button className="auth__submit" type="submit" disabled={busy}>
            {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>

          {!isRegister && (
            <>
              <button
                className="auth__demo"
                type="button"
                data-testid="auth-demo"
                onClick={handleDemo}
                disabled={busy}
              >
                Coordinator demo
              </button>
              <button
                className="auth__demo auth__demo--viewer"
                type="button"
                data-testid="auth-viewer-demo"
                onClick={handleViewerDemo}
                disabled={busy}
              >
                Availability demo
              </button>
            </>
          )}

          <p className="auth__switch">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isRegister ? "login" : "register")}
            >
              {isRegister ? "Sign in" : "Create one"}
            </button>
          </p>

          {!isRegister && (
            <p className="auth__hint">
              Coordinator: {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
              <br />
              Availability: {VIEWER_ACCOUNT.email} / {VIEWER_ACCOUNT.password}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
