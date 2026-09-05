'use client'
import { Icon } from '@/components/mort/icon'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
export function MortHero() {
  const reduced = useReducedMotion()
  return <section className="cinema-hero" aria-labelledby="hero-title">
    <div className="hero-coordinate" aria-hidden="true">MORT / THE FIRST CROSSING<span>01 — LOCAL OPPORTUNITY</span></div>
    <motion.div className="hero-copy" initial={false} animate={{ opacity: 1, y: 0 }}>
      <div className="eyeline"><span /> YOUR NEXT CHAPTER STARTS NEARBY</div>
      <h1 id="hero-title">Small beginnings.<br /><span>Real horizons.</span></h1>
      <p>Find local work. Earn your own way.<br />Build something that stays with you.</p>
      <div className="hero-actions"><Link className="btn primary lg" href="/signup">Start your crossing <span aria-hidden="true"><Icon name="↗" size={18} /></span></Link><Link className="text-link" href="#crossing">Explore MORT <span aria-hidden="true">↓</span></Link></div>
      <div className="hero-fine">For teens 13–17. With adults and guardians alongside.</div>
    </motion.div>
    <motion.div className="hero-art-zone" data-scene-drag="true" aria-label="Decorative interactive atmosphere" initial={false} animate={reduced ? {} : { opacity: [0, 1] }} transition={{ duration: 1.5 }}>
      <span className="beacon-label">THE BEACON<span>There is a way forward.</span></span>
      <span className="drag-instruction"><span aria-hidden="true"><Icon name="↔" size={18} /></span> Hold & drag to move the atmosphere</span>
    </motion.div>
    <div className="hero-bottom"><span>MOVE WITH PURPOSE.</span><Link href="#crossing">THE CROSSING <span aria-hidden="true">↓</span></Link><span>BUILT AROUND REAL LIFE.</span></div>
  </section>
}
