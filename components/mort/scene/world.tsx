'use client'
import { Suspense, useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Water } from './environment/water'
import { Terrain } from './environment/terrain'
import { Particles } from './environment/particles'
import { Fragments } from './physics/fragments'
import { Beacon } from './beacon'
import { Ribbon } from './ribbon'
import { decayDrag, type DragState } from './input/drag-state'

type Props = { quiet: boolean; paused: boolean; drag: RefObject<DragState>; onFailure: () => void }
function FrameBudget({ paused, quiet, low }: { paused: boolean; quiet: boolean; low: boolean }) {
  const advance = useThree(s => s.advance)
  const simulationTime = useRef(0)
  const mobile = useThree(s => s.size.width < 760)
  useEffect(() => {
    let frame = 0, previous = 0
    const interval = quiet || mobile || low ? 1000 / 30 : 1000 / 60
    const tick = (time: number) => {
      if (!previous || time - previous >= interval - .5) {
        simulationTime.current += previous ? Math.min((time - previous) / 1000, .05) : 1 / 60
        advance(simulationTime.current)
        previous = time
      }
      if (!paused) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [paused, quiet, low, mobile, advance])
  return null
}
function Lifecycle({ onFailure }: { onFailure: () => void }) {
  const gl = useThree(s => s.gl)
  useEffect(() => {
    const fail = (event: Event) => { event.preventDefault(); onFailure() }
    gl.domElement.addEventListener('webglcontextlost', fail)
    return () => gl.domElement.removeEventListener('webglcontextlost', fail)
  }, [gl, onFailure])
  return null
}
function CameraRig({ quiet, drag }: Pick<Props, 'quiet' | 'drag'>) {
  const scroll = useRef(0), frames = useRef(0)
  const wasMobile = useRef<boolean | null>(null)
  useEffect(() => {
    const update = () => { scroll.current = window.scrollY / Math.max(1, window.innerHeight) }
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  useFrame(({ camera, size }, delta) => {
    const dt = Math.min(delta, .05)
    decayDrag(drag.current, dt)
    const mobile = size.width < 760
    const targetZ = mobile ? 22 : 16
    if (wasMobile.current !== mobile) {
      camera.position.set(mobile ? 3.5 : 0, quiet ? 3 : 2.6, targetZ)
      wasMobile.current = mobile
    }
    camera.position.x += ((mobile ? 3.5 : 0) + drag.current.vx * .055 - camera.position.x) * (1 - Math.exp(-2 * dt))
    camera.position.y += ((quiet ? 3 : 2.6 + Math.min(scroll.current, 4) * .22) - camera.position.y) * (1 - Math.exp(-2 * dt))
    camera.position.z += (targetZ - Math.min(scroll.current, 5) * (quiet ? 0 : .25) - camera.position.z) * (1 - Math.exp(-2 * dt))
    camera.lookAt(mobile ? 3.5 : 0, mobile ? 6 : .7, -7)
    // Observable diagnostics for real browser interaction/visibility regression tests.
    if (++frames.current % 12 === 0) {
      const element = document.querySelector<HTMLElement>('.mort-world')
      if (element) { element.dataset.energy = drag.current.energy.toFixed(4); element.dataset.frames = String(frames.current) }
    }
  })
  return null
}
export default function World({ quiet, paused, drag, onFailure }: Props) {
  const [low, setLow] = useState(false)
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const media = matchMedia('(max-width: 760px)')
    const sync = () => setMobile(media.matches)
    sync(); media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  return <Canvas onCreated={({ gl }) => { gl.domElement.closest<HTMLElement>('.mort-world')?.setAttribute('data-webgl-ready', 'true') }} camera={{ position: [0, 2.6, 16], fov: 43, near: .1, far: 200 }} dpr={low || mobile || quiet ? 1 : 1.5} frameloop="never" gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} fallback={null}>
    <FrameBudget paused={paused} quiet={quiet} low={low} />
    <Lifecycle onFailure={onFailure} />
    <PerformanceMonitor onDecline={() => setLow(true)} flipflops={1} onFallback={() => setLow(true)} />
    <CameraRig quiet={quiet} drag={drag} />
    <fog attach="fog" args={['#080e16', 35, 130]} />
    <ambientLight intensity={.45} />
    <directionalLight position={[-6, 8, 5]} intensity={3} color="#e5e9ed" />
    <directionalLight position={[9, 2, -2]} intensity={2} color="#8ba4bf" />
    <Environment resolution={64} frames={1}>
      <Lightformer position={[-5, 5, 3]} scale={[3, 9, 1]} intensity={5} />
      <Lightformer position={[5, 1, 4]} scale={[2, 8, 1]} intensity={3} />
    </Environment>
    <Terrain /><Water drag={drag} /><Beacon quiet={quiet} />
    <Particles count={quiet ? 70 : mobile || low ? 140 : 350} drag={drag} />
    <Suspense fallback={null}><Physics gravity={[0, 0, 0]} timeStep={1 / 60} paused={paused}>
      <Fragments count={quiet ? 4 : mobile || low ? 7 : 12} drag={drag} />
    </Physics></Suspense>
    <Ribbon drag={drag} />
  </Canvas>
}
