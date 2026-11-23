"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { LEGAL, TERMS_SECTIONS } from "@/lib/legal";

const HEADINGS = [
  { id: "s0", label: "Plain-language overview" },
  ...TERMS_SECTIONS.map((t, i) => ({ id: "s" + (i + 1), label: `${i + 1}. ${t}` })),
];

export default function TermsDoc() {
  const [current, setCurrent] = useState("s0");
  const docRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = docRef.current?.querySelectorAll("h2");
    if (!els) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: "-90px 0px -70% 0px" }
    );
    els.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, []);

  const jump = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      <div className="lhead">
        <div className="wrap">
          <h1>Master Terms of Service</h1>
          <p className="ver">{LEGAL.version}</p>
          <div className="docs" aria-label="Legal documents">
            <a href="/legal/terms" aria-current="page">Master Terms</a>
            <a href="https://mortapp.org/legal/privacy">Privacy Policy</a>
            <a href="https://mortapp.org/legal/safety">Safety Rules</a>
            <a href="https://mortapp.org/legal/community">Community Guidelines</a>
          </div>
        </div>
      </div>
      <div className="wrap lbody">
        <div className="toc" aria-label="Sections">
          {HEADINGS.map((h) => (
            <button key={h.id} aria-current={current === h.id} onClick={() => jump(h.id)}>
              {h.label}
            </button>
          ))}
        </div>
        <article className="doc" ref={docRef}>
          <h2 id="s0">Plain-language overview</h2>
          <p>
            MORT provides software for adults and eligible teens to find and coordinate local tasks. MORT is not the person who performs a task. A task is an arrangement between the adult who posts it and the teen who accepts it, subject to applicable law and any required guardian approval. Legal classification depends on actual facts and law, not the labels in these Terms.
          </p>
          <p>
            A parent or legal guardian (“Guardian”) must give verifiable consent before a teen account is enabled. The teen must also agree in an age-appropriate manner. Guardian approval is required for each task as specified in these Terms and in the product. A Guardian’s consent does not waive a teen’s legal rights or automatically make the Guardian the person who earned the teen’s pay.
          </p>
          <div className="live">
            <h3>{LEGAL.liveTitle}</h3>
            <p style={{ margin: 0 }}>{LEGAL.live}</p>
          </div>
          {TERMS_SECTIONS.map((t, i) => (
            <Fragment key={t}>
              <h2 id={"s" + (i + 1)}>{i + 1}. {t}</h2>
              <p className="stub">
                Section {i + 1} of the published document. <a href={LEGAL.fullTextUrl}>Read the full text</a>.
              </p>
            </Fragment>
          ))}
        </article>
      </div>
    </>
  );
}
