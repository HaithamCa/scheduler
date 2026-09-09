import React from "react";
import ReactDOM from "react-dom";

import "index.scss";

import AppHeader from "components/AppHeader";
import Application from "components/Application";
import Availability from "components/Availability/Availability";
import AuthScreen, { AuthSplash } from "components/Auth/AuthScreen";
import useAuth from "hooks/useAuth";

function Root() {
  const {
    user,
    ready,
    login,
    register,
    loginDemo,
    loginViewerDemo,
    logout,
  } = useAuth();

  if (!ready) {
    return (
      <div className="app-root">
        <AuthSplash />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-root">
        <AuthScreen
          onLogin={login}
          onRegister={register}
          onDemo={loginDemo}
          onViewerDemo={loginViewerDemo}
        />
      </div>
    );
  }

  const page =
    user.role === "viewer" ? (
      <Availability user={user} onLogout={logout} />
    ) : (
      <Application user={user} onLogout={logout} />
    );

  return (
    <div className="app-root">
      <AppHeader user={user} onLogout={logout} />
      {page}
    </div>
  );
}

ReactDOM.render(<Root />, document.getElementById("root"));
