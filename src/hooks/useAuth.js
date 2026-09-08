import { useEffect, useState } from "react";

const USERS_KEY = "scheduler.users";
const SESSION_KEY = "scheduler.session";

export const DEMO_ACCOUNT = {
  name: "Demo User",
  email: "demo@scheduler.app",
  password: "demo1234",
  role: "coordinator",
};

export const VIEWER_ACCOUNT = {
  name: "Alex Viewer",
  email: "viewer@scheduler.app",
  password: "viewer1234",
  role: "viewer",
};

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function writeSession(user) {
  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "coordinator",
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

async function hashPassword(password) {
  if (window.crypto && window.crypto.subtle) {
    const data = new TextEncoder().encode(password);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
  return `fallback:${password}`;
}

async function seedAccount(users, account) {
  const email = normalizeEmail(account.email);
  if (users.some((user) => user.email === email)) {
    return users;
  }

  users.push({
    id: account.role,
    name: account.name,
    email,
    role: account.role,
    passwordHash: await hashPassword(account.password),
  });
  return users;
}

async function ensureDemoUser() {
  let users = readUsers().map((user) => ({
    ...user,
    role: user.role || "coordinator",
  }));
  users = await seedAccount(users, DEMO_ACCOUNT);
  users = await seedAccount(users, VIEWER_ACCOUNT);
  writeUsers(users);
}

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await ensureDemoUser();
      if (cancelled) {
        return;
      }
      const session = readSession();
      if (session && session.email) {
        const match = readUsers().find((entry) => entry.email === session.email);
        setUser(
          match
            ? {
                id: match.id,
                name: match.name,
                email: match.email,
                role: match.role || "coordinator",
              }
            : { ...session, role: session.role || "coordinator" }
        );
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const normalized = normalizeEmail(email);
    if (!normalized || !password) {
      return { ok: false, error: "Enter your email and password." };
    }

    const match = readUsers().find((entry) => entry.email === normalized);
    if (!match) {
      return { ok: false, error: "No account found for that email." };
    }

    const passwordHash = await hashPassword(password);
    if (match.passwordHash !== passwordHash) {
      return { ok: false, error: "Incorrect password. Try again." };
    }

    const session = writeSession(match);
    setUser(session);
    return { ok: true };
  };

  const register = async ({ name, email, password, role }) => {
    const trimmedName = String(name || "").trim();
    const normalized = normalizeEmail(email);
    const nextRole = role === "viewer" ? "viewer" : "coordinator";

    if (!trimmedName) {
      return { ok: false, error: "Enter your name." };
    }
    if (!normalized) {
      return { ok: false, error: "Enter a valid email." };
    }
    if (!password || password.length < 8) {
      return { ok: false, error: "Use a password with at least 8 characters." };
    }

    const users = readUsers();
    if (users.some((entry) => entry.email === normalized)) {
      return { ok: false, error: "That email is already registered. Sign in instead." };
    }

    const created = {
      id: String(Date.now()),
      name: trimmedName,
      email: normalized,
      role: nextRole,
      passwordHash: await hashPassword(password),
    };
    writeUsers([...users, created]);
    const session = writeSession(created);
    setUser(session);
    return { ok: true };
  };

  const loginDemo = () => login(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
  const loginViewerDemo = () =>
    login(VIEWER_ACCOUNT.email, VIEWER_ACCOUNT.password);

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return {
    user,
    ready,
    login,
    register,
    loginDemo,
    loginViewerDemo,
    logout,
  };
}
