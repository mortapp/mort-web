"use client";

import { useState } from "react";

const ROLES = {
  teen: {
    title: "Turn your time into something.",
    body: "Find real, age-appropriate work in your neighborhood, apply in minutes, and build a reputation.",
    cta: "Create a teen account",
    bar: ["Home", "Explore", "Inbox", "Profile"],
  },
  adult: {
    title: "Post it. Pick the right teen.",
    body: "Describe the job, review applicants, and manage the work from one place. Built for neighbors and local businesses.",
    cta: "Create an adult account",
    bar: ["Home", "Explore", "+", "Inbox", "Profile"],
  },
} as const;

type Role = keyof typeof ROLES;

export default function Roles() {
  const [role, setRole] = useState<Role>("teen");
  const r = ROLES[role];
  const bar: readonly string[] = r.bar;

  return (
    <section>
      <div className="wrap">
        <h2>One product, two sides of the street.</h2>
        <div className="roles">
          <div className="seg" role="tablist" aria-label="Choose your role">
            <button role="tab" aria-selected={role === "teen"} onClick={() => setRole("teen")}>I’m a teen</button>
            <button role="tab" aria-selected={role === "adult"} onClick={() => setRole("adult")}>I’m hiring</button>
          </div>
          <div className="rolebody" role="tabpanel">
            <div>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
              <a className="btn" href="https://mortapp.org/signup">{r.cta}</a>
            </div>
            <div className="bar" aria-label="App navigation">
              {bar.map((t, i) =>
                t === "+" ? (
                  <b key={t} className="plus" aria-label="Post a job">+</b>
                ) : (
                  <span key={t} className={i === 0 ? "on" : undefined}>{t}</span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
