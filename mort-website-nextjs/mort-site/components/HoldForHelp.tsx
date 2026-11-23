"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_MSG =
  "Help takes a deliberate hold, so it can’t be triggered by accident. Try it.";

export default function HoldForHelp() {
  const [go, setGo] = useState(false);
  const [msg, setMsg] = useState(DEFAULT_MSG);
  const goRef = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const start = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    goRef.current = true;
    setGo(true);
    setMsg("Keep holding…");
    timer.current = window.setTimeout(() => {
      goRef.current = false;
      setGo(false);
      setMsg("Demo only. This site doesn’t contact anyone. In danger, call 911.");
    }, reduce ? 300 : 1250);
  };

  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current);
    if (goRef.current) {
      goRef.current = false;
      setGo(false);
      setMsg("Released early, nothing was sent. That’s the point.");
    }
  };

  return (
    <div className="hold">
      <button
        className={"hb" + (go ? " go" : "")}
        aria-describedby="hm"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) start(e);
        }}
        onKeyUp={stop}
      >
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <circle className="tr" cx="90" cy="90" r="86" />
          <circle className="pr" cx="90" cy="90" r="86" />
        </svg>
        Hold for help
      </button>
      <p className="hmsg" id="hm" aria-live="polite">{msg}</p>
    </div>
  );
}
