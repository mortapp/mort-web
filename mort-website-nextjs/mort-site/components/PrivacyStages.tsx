"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { tab: "Before anyone is accepted", k: "What you see", addr: "Broad Ripple area · 1.2 mi", mask: false,
    why: "Area and distance only. No street number, map pin, or coordinates.", tag: "Exact address: not shown" },
  { tab: "Accepted, before travel", k: "What you see", addr: "Broad Ripple area · 1.2 mi", mask: false,
    why: "You’re on the schedule. The exact address stays protected unless it’s needed.", tag: "Exact address: protected" },
  { tab: "On the way and on the job", k: "While you travel and work", addr: "1234 Example St", mask: true,
    why: "MORT navigation opens the route. The address appears only while it’s needed.", tag: "Exact address: visible for now" },
  { tab: "After it’s done", k: "In your history", addr: "Broad Ripple area · 1.2 mi away", mask: false,
    why: "The exact address is gone from history. That protects the teen and the person who posted.", tag: "Exact address: removed" },
];

export default function PrivacyStages() {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const st = STAGES[i];

  useEffect(() => {
    if (!st.mask) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setShown(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [i, st.mask]);

  return (
    <section className="priv" id="privacy">
      <div className="wrap">
        <h2>Your address isn’t a permanent record.</h2>
        <div className="prow">
          <div className="stages" role="tablist" aria-label="Job stage">
            {STAGES.map((s, j) => (
              <button
                key={s.tab}
                role="tab"
                aria-selected={j === i}
                onClick={() => {
                  setShown(false);
                  setI(j);
                }}
              >
                {s.tab}
              </button>
            ))}
          </div>
          <div className="panel" role="tabpanel" aria-live="polite">
            <div className="k">{st.k}</div>
            <div className="addr">
              {st.mask ? (
                <span className={"mask" + (shown ? " shown" : "")}>{st.addr}</span>
              ) : (
                st.addr
              )}
            </div>
            <p className="why">{st.why}</p>
            <span className="tag">{st.tag}</span>
            <p className="sample">Sample address for illustration.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
