import React from "react";
import ReactDOM from "react-dom";

import "index.scss";

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
    return <AuthSplash />;
  }

  if (!user) {
    return (
      <AuthScreen
        onLogin={login}
        onRegister={register}
        onDemo={loginDemo}
        onViewerDemo={loginViewerDemo}
      />
    );
  }

  if (user.role === "viewer") {
    return <Availability user={user} onLogout={logout} />;
  }

  return <Application user={user} onLogout={logout} />;
}

ReactDOM.render(<Root />, document.getElementById("root"));
