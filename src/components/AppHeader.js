import React from "react";
import asset from "helpers/asset";
import "./AppHeader.scss";

function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AppHeader({ user, onLogout }) {
  const isViewer = user && user.role === "viewer";

  return (
    <header className="app-header">
      <img
        className="app-header__logo"
        src={asset("images/logo.png")}
        alt="Interview Scheduler"
      />
      {user && (
        <div className="app-header__account">
          <div
            className={
              isViewer
                ? "app-header__avatar app-header__avatar--viewer"
                : "app-header__avatar"
            }
            aria-hidden="true"
          >
            {initials(user.name)}
          </div>
          <div className="app-header__copy">
            <p className="app-header__name">{user.name}</p>
            <p className="app-header__email">{user.email}</p>
            <p className="app-header__role">
              {isViewer ? "Availability view" : "Full schedule"}
            </p>
          </div>
          {onLogout && (
            <button type="button" className="app-header__logout" onClick={onLogout}>
              Log out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
