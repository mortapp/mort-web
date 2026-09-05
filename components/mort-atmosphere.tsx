'use client'
import dynamic from 'next/dynamic'
import { Component, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useSceneInput } from './mort/scene/input/use-scene-input'

const World = dynamic(() => import('./mort/scene/world'), { ssr: false })
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}
export function MortAtmosphere() {
  const quiet = usePathname() !== '/'
  const [ready, setReady] = useState(false)
  const [reduced, setReduced] = useState(true)
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [failed, setFailed] = useState(false)
  const drag = useSceneInput(ready && !reduced && !paused && !hidden && !failed)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    const visibility = () => setHidden(document.hidden)
    const timer = window.setTimeout(() => {
      sync(); visibility()
      // Canvas fallback children cannot signal failure: browsers mount them even
      // when WebGL works. Probe support before mounting the renderer instead.
      const probe = document.createElement('canvas')
      const context = probe.getContext('webgl2')
      if (!context) setFailed(true)
      else context.getExtension('WEBGL_lose_context')?.loseContext()
      try { setPaused(localStorage.getItem('mort-atmosphere-paused') === 'true') } catch { /* Storage is optional. */ }
      setReady(true)
    }, 100)
    media.addEventListener('change', sync)
    document.addEventListener('visibilitychange', visibility)
    return () => { clearTimeout(timer); media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  const toggle = () => setPaused(value => {
    try { localStorage.setItem('mort-atmosphere-paused', String(!value)) } catch { /* Storage is optional. */ }
    return !value
  })
  return <>
    <div className={`mort-world ${quiet ? 'is-quiet' : ''}`} aria-hidden="true" data-scene-status={failed ? 'fallback' : reduced ? 'reduced' : paused ? 'paused' : 'running'}>
      <div className="world-fallback"><div className="fallback-moon" /><div className="fallback-ridge ridge-far" /><div className="fallback-ridge ridge-near" /><div className="fallback-water" /><div className="fallback-beacon" /></div>
      {ready && !reduced && !failed && <SceneBoundary onFailure={() => setFailed(true)}>
        <World quiet={quiet} paused={paused || hidden} drag={drag} onFailure={() => setFailed(true)} />
      </SceneBoundary>}
      <div className="world-shade" />
    </div>
    {!reduced && !failed && <button type="button" className="atmosphere-toggle" aria-pressed={paused} onClick={toggle} aria-label={paused ? 'Resume atmosphere' : 'Pause atmosphere'}>
      <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span><span>{paused ? 'Resume' : 'Pause'} atmosphere</span>
    </button>}
  </>
}
