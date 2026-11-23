"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TXT = "Mow my front lawn, it’s about half an acre";
const AMOUNTS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function PostDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const typer = useRef<number | null>(null);
  const delay = useRef<number | null>(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);
  const [sugOn, setSugOn] = useState(false);
  const [amt, setAmt] = useState(30);
  const [other, setOther] = useState(false);

  const stopTimers = () => {
    if (typer.current) window.clearInterval(typer.current);
    if (delay.current) window.clearTimeout(delay.current);
  };

  const play = useCallback(() => {
    stopTimers();
    setAmt(30);
    setOther(false);
    setSugOn(false);
    setText("");
    setTyping(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(TXT);
      setTyping(false);
      setSugOn(true);
      return;
    }
    let n = 0;
    typer.current = window.setInterval(() => {
      n++;
      setText(TXT.slice(0, n));
      if (n >= TXT.length) {
        if (typer.current) window.clearInterval(typer.current);
        setTyping(false);
        delay.current = window.setTimeout(() => setSugOn(true), 300);
      }
    }, 32);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es, o) => {
        if (es[0].isIntersecting) {
          play();
          o.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stopTimers();
    };
  }, [play]);

  return (
    <section className="post" id="post" ref={sectionRef}>
      <div className="wrap">
        <h2>Posting is a sentence, not a form.</h2>
        <div className="pgrid">
          <div>
            <p className="lede">
              Say what you need in plain words. MORT suggests the title, category, time, tools, and pay. You confirm or change everything before it goes live.
            </p>
            <p className="pnote">
              The exact address stays private. Teens see the area and distance. Before you publish, you see the real job card a teen will see.
            </p>
            <div className="row" style={{ marginTop: 28 }}>
              <button className="btn ghost" onClick={play}>Replay</button>
            </div>
          </div>
          <div className="sheet" aria-label="Illustration of the MORT post-a-job flow">
            <h4>What do you need help with?</h4>
            <div className={"field" + (typing ? " caret" : "")} aria-live="polite">{text}</div>
            <div className={"sug" + (sugOn ? " on" : "")}>
              <div><span>Title</span><b>Mow the front lawn</b></div>
              <div><span>Category</span><b>Lawn care</b></div>
              <div><span>Time needed</span><b>About 1 hr</b></div>
              <div><span>Tools</span><b>Poster provides mower</b></div>
            </div>
            <div className="pay">
              <div className="lab">Pay · tap to change, or type an amount</div>
              <div className="pills" role="group" aria-label="Pay amount">
                {AMOUNTS.map((a) => (
                  <button key={a} type="button" aria-pressed={a === amt} onClick={() => { setAmt(a); setOther(false); }}>
                    ${a}
                    {a === 30 && <span className="rec">Suggested</span>}
                  </button>
                ))}
                {other ? (
                  <input
                    type="number"
                    min={10}
                    inputMode="numeric"
                    placeholder="$ amount"
                    aria-label="Type a pay amount, minimum 10 dollars"
                    autoFocus
                    onBlur={(e) => {
                      let v = Math.floor(+e.currentTarget.value);
                      if (!(v >= 10)) {
                        v = 10;
                        e.currentTarget.value = "10";
                      }
                      setAmt(v);
                    }}
                    style={{
                      width: 96, minHeight: 44, borderRadius: 12, border: "1.5px solid var(--fg)",
                      background: "var(--bg)", color: "var(--fg)", fontWeight: 700, fontSize: 15,
                      fontFamily: "inherit", padding: "0 10px",
                    }}
                  />
                ) : (
                  <button type="button" onClick={() => setOther(true)}>Other</button>
                )}
              </div>
            </div>
            <p className="rule">
              Late-cancellation window: set by MORT from the job’s length and effort, shown before you publish.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
