import React from "react";
import "components/Application.scss";

function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar({ user, onLogout, children }) {
  const isViewer = user && user.role === "viewer";

  return (
    <section className="sidebar">
      <img
        className="sidebar--centered"
        src="images/logo.png"
        alt="Interview Scheduler"
      />
      <hr className="sidebar__separator sidebar--centered" />
      <nav className="sidebar__menu">{children}</nav>
      {user && (
        <div className="sidebar__account">
          <div
            className={
              isViewer ? "sidebar__avatar sidebar__avatar--viewer" : "sidebar__avatar"
            }
            aria-hidden="true"
          >
            {initials(user.name)}
          </div>
          <div className="sidebar__account-copy">
            <p className="sidebar__account-name">{user.name}</p>
            <p className="sidebar__account-email">{user.email}</p>
            <p className="sidebar__role">
              {isViewer ? "Availability view" : "Full schedule"}
            </p>
          </div>
          {onLogout && (
            <button type="button" className="sidebar__logout" onClick={onLogout}>
              Log out
            </button>
          )}
        </div>
      )}
    </section>
  );
}
