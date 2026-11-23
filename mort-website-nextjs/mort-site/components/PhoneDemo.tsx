"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ApplyState = "idle" | "applying" | "applied" | "view";

export default function PhoneDemo() {
  const [s, setS] = useState<ApplyState>("idle");
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const run = useCallback(() => {
    clear();
    setS("idle");
    timers.current.push(
      window.setTimeout(() => setS("applying"), 500),
      window.setTimeout(() => setS("applied"), 1700),
      window.setTimeout(() => setS("view"), 3000)
    );
  }, []);

  useEffect(() => {
    const t = window.setTimeout(run, 1200);
    return () => {
      window.clearTimeout(t);
      clear();
    };
  }, [run]);

  return (
    <div className="stage" aria-label="Illustration of the MORT app Home screen">
      <div className="phone">
        <h4>Quick jobs</h4>
        <div className="rail">
          <div className="chip"><b>Take out bins</b><span>10 min · $10</span></div>
          <div className="chip"><b>Water plants</b><span>15 min · $12</span></div>
          <div className="chip"><b>Carry groceries</b><span>20 min · $15</span></div>
        </div>
        <div className="job">
          <div className="top"><span className="dist">0.4 mi</span><span>Dana R. · Verified</span></div>
          <div className="t">Walk Biscuit around the block</div>
          <div className="m">Today, 4:30 PM · 30 min</div>
          <div className="foot">
            <span className="pay">$20</span>
            <button
              className="apply"
              data-s={s}
              onClick={() => {
                if (s === "idle") run();
              }}
            >
              {s === "idle" && "Apply"}
              {s === "applying" && (
                <>
                  Applying<span className="dots" />
                </>
              )}
              {s === "applied" && "Applied ✓"}
              {s === "view" && "View application"}
            </button>
          </div>
        </div>
        <div className="job">
          <div className="top"><span className="dist">0.9 mi</span><span>Marcus T. · Verified</span></div>
          <div className="t">Rake front yard leaves</div>
          <div className="m">Sat, 10:00 AM · 1 hr</div>
          <div className="foot">
            <span className="pay">$30</span>
            <button className="apply" tabIndex={-1} aria-hidden="true">Apply</button>
          </div>
        </div>
        <div className="tabs">
          <span className="on">Home</span><span>Explore</span><span>Inbox</span><span>Profile</span>
        </div>
      </div>
      <button className="replay" onClick={run}>Replay Apply</button>
    </div>
  );
}
