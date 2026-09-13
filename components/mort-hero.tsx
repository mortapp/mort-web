'use client'
import { Icon } from '@/components/mort/icon'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
export function MortHero() {
  const reduced = useReducedMotion()
  return <section className="cinema-hero voyage-hero" aria-labelledby="hero-title">
    <div className="hero-coordinate" aria-hidden="true">MORT / FIRST LIGHT<span>01 — LOCAL OPPORTUNITY</span></div>
    <motion.div className="hero-copy" initial={false} animate={{ opacity: 1, y: 0 }}>
      <div className="eyeline"><span /> LOCAL OPPORTUNITY, FOR TEENS 13–17</div>
      <h1 id="hero-title" className="voyage-wordmark" aria-label="MORT"><span>M</span><span>O</span><span>R</span><span>T</span></h1>
      <p className="voyage-tag">Earn nearby. <em>Move smart.</em></p>
      <p>Real work in your own neighborhood — dog walking, yard care, tutoring — held inside a calm, guardian-watched crossing from the first message to the last handshake.</p>
      <div className="hero-actions"><Link className="btn primary lg" href="/signup">Begin the crossing <span aria-hidden="true"><Icon name="→" size={18} /></span></Link><Link className="text-link" href="#crossing">How safety works <span aria-hidden="true">↓</span></Link></div>
      <div className="hero-fine">A clear voyage from discovery to completion. No one crosses alone.</div>
    </motion.div>
    <motion.div className="hero-art-zone" data-scene-drag="true" aria-label="Decorative interactive ocean atmosphere" initial={false} animate={reduced ? {} : { opacity: [0, 1] }} transition={{ duration: 1.5 }}>
      <span className="beacon-label">THE BEACON<span>There is a way forward.</span></span>
      <span className="drag-instruction"><span aria-hidden="true"><Icon name="↔" size={18} /></span> Hold &amp; drag to move the atmosphere</span>
    </motion.div>
    <div className="hero-bottom"><span>MOVE WITH PURPOSE.</span><Link href="#crossing">SCROLL TO SAIL <span aria-hidden="true">↓</span></Link><span>BUILT AROUND REAL LIFE.</span></div>
  </section>
}
