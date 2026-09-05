'use client'
import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
const VoyageCanvas = dynamic(() => import('./mort/scene/voyage-canvas'), { ssr: false })
class VoyageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}
const STOPS = [
  ['Discover', 'Find your starting point.', 'Explore nearby, age-appropriate jobs with approximate locations.'],
  ['Apply', 'Put yourself forward.', 'Send an application. The poster reviews it, with guardian approval when required.'],
  ['Accepted', 'A clear next step.', 'The poster chooses an applicant. Acceptance is a real status, never an assumption.'],
  ['Scheduled', 'Make a plan together.', 'Agree on the details and timing before the work begins.'],
  ['In progress', 'Show up. Make it count.', 'Use the job’s PIN start flow. Messaging and safety tools stay within reach.'],
  ['Completed', 'Take the experience with you.', 'Follow the completion flow and keep a record of the work you have done.'],
]
export function MortVoyage() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(true)
  const [paused, setPaused] = useState(false)
  const zone = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    const state = () => {
      const world = document.querySelector('.mort-world')
      setPaused(document.hidden || world?.getAttribute('data-scene-status') === 'paused')
    }
    const observer = new IntersectionObserver(([entry]) => { setVisible(entry.isIntersecting); sync(); state() })
    if (zone.current) observer.observe(zone.current)
    const mutations = new MutationObserver(state)
    const world = document.querySelector('.mort-world')
    if (world) mutations.observe(world, { attributes: true, attributeFilter: ['data-scene-status'] })
    media.addEventListener('change', sync); document.addEventListener('visibilitychange', state)
    return () => { observer.disconnect(); mutations.disconnect(); media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', state) }
  }, [])
  const select = (index: number) => setActive(index)
  return <div className="voyage-system">
    <div ref={zone} id="voyage-view" className="voyage-view" data-scene-drag="true" aria-hidden="true">
      <svg className="voyage-fallback" viewBox="0 0 1000 160" preserveAspectRatio="none"><path d="M40 110 C200 -30 260 190 430 80 S700 160 960 40" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
      {visible && !reduced && <VoyageBoundary><VoyageCanvas active={active} paused={paused} /></VoyageBoundary>}
      <span className="voyage-watermark">THE CROSSING</span>
    </div>
    <div className="voyage-stops" aria-label="Explore the job lifecycle">
      {STOPS.map(([label], index) => <button key={label} type="button" aria-pressed={active === index} aria-controls="voyage-description" onClick={() => select(index)}><span className="voyage-number">0{index + 1}</span><span>{label}</span><span className="voyage-dot" aria-hidden="true" /></button>)}
    </div>
    <div id="voyage-description" className="voyage-description" aria-live="polite" aria-atomic="true"><span className="eyeline">0{active + 1} / {STOPS[active][0]}</span><h3>{STOPS[active][1]}</h3><p>{STOPS[active][2]}</p></div>
  </div>
}
