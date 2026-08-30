'use client'

// The MORT wordmark writes itself on in light, then a tagline types out beneath it.
import { useEffect, useRef } from 'react'

export function MortHero() {
  const line = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = line.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = 'Earn nearby · Move smart'
      return
    }
    const phrases = ['Earn nearby.', 'Move smart.', 'Build real experience.']
    let pi = 0, ci = 0, deleting = false, timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const word = phrases[pi]
      if (!deleting) {
        node.textContent = word.slice(0, ++ci)
        if (ci === word.length) { deleting = true; timer = setTimeout(tick, 1500); return }
        timer = setTimeout(tick, 60 + Math.random() * 40)
      } else {
        node.textContent = word.slice(0, --ci)
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; timer = setTimeout(tick, 320); return }
        timer = setTimeout(tick, 32)
      }
    }
    timer = setTimeout(tick, 900)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="mort-hero-brand">
      <div className="mort-eyebrow">Local opportunity infrastructure</div>
      <h1 className="mort-wordmark" aria-label="MORT">
        <span className="ltr" aria-hidden="true">M</span>
        <span className="ltr" aria-hidden="true">O</span>
        <span className="ltr" aria-hidden="true">R</span>
        <span className="ltr" aria-hidden="true">T</span>
      </h1>
      <p className="mort-typed"><span ref={line} /><span className="mort-caret" /></p>
      <p className="lead">Find real local work, connect safely, and build experience while you earn — for teens 13–17, with the structure and accountability the informal world never had.</p>
    </div>
  )
}
