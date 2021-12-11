import React, { useState } from "react";

const useVisualMode = (initial) => {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  function transition(newMode, replace = false) {
    setMode(newMode);
    if (replace) {
      setHistory([...history.slice(0, history.length - 1), newMode]);
    } else {
      setHistory([...history, newMode]);
    }
  }
  // back to previous mode
  function back() {
    if (history.length > 1) {
      setMode(history[history.length - 2]);
      setHistory(history.slice(0, history.length - 1));
    }
  }
  return { mode, transition, back };
};

export default useVisualMode;
