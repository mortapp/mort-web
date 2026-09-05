import { useRef, type RefObject } from 'react'
import { useBeforePhysicsStep, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import type { DragState } from '../input/drag-state'
function Fragment({ index, drag }: { index: number; drag: RefObject<DragState> }) {
  const body = useRef<RapierRigidBody>(null)
  const lastSequence = useRef(0)
  const steps = useRef(0)
  const angle = index * 2.399
  const anchor = { x: 4.5 + Math.cos(angle) * (2.4 + index * .09), y: 2 + Math.sin(angle) * 2.8, z: -1 - index * .38 }
  useBeforePhysicsStep(() => {
    const rb = body.current
    if (!rb) return
    const p = rb.translation(), v = rb.linvel()
    if (index === 0 && ++steps.current % 15 === 0) {
      document.querySelector<HTMLElement>('.mort-world')?.setAttribute('data-physics-displacement', Math.hypot(p.x - anchor.x, p.y - anchor.y, p.z - anchor.z).toFixed(5))
    }
    // Hooke's law + viscous damping, integrated by Rapier at a fixed 60 Hz.
    rb.resetForces(false)
    rb.addForce({ x: (anchor.x - p.x) * .85 - v.x * .3, y: (anchor.y - p.y) * .85 - v.y * .3, z: (anchor.z - p.z) * .85 - v.z * .3 }, true)
    if (lastSequence.current === drag.current.sequence) return
    lastSequence.current = drag.current.sequence
    const d = drag.current
    const x = (d.x / window.innerWidth - .5) * 24, y = (.5 - d.y / window.innerHeight) * 14
    const influence = Math.exp(-Math.hypot(p.x - x, p.y - y) * .22)
    rb.applyImpulse({ x: d.vx * influence * .08, y: -d.vy * influence * .08, z: -d.energy * influence * .045 }, true)
    rb.applyTorqueImpulse({ x: d.vy * .006, y: d.vx * .006, z: d.energy * .004 }, true)
  })
  return <RigidBody ref={body} position={[anchor.x, anchor.y, anchor.z]} colliders="hull" linearDamping={1.5} angularDamping={2.8} restitution={.25} mass={.35}>
    <mesh scale={[.13 + index % 3 * .035, .4 + index % 4 * .12, .16]} rotation={[index, angle, .4]}>
      <octahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#c9ced4" metalness={.85} roughness={.21} />
    </mesh>
  </RigidBody>
}
export function Fragments({ count, drag }: { count: number; drag: RefObject<DragState> }) {
  return <>{Array.from({ length: count }, (_, index) => <Fragment key={index} index={index} drag={drag} />)}</>
}
