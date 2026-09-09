import React from "react";
import "components/Application.scss";

export default function Sidebar({ children }) {
  return (
    <section className="sidebar">
      <nav className="sidebar__menu">{children}</nav>
    </section>
  );
}
