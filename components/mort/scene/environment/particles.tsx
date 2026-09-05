import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, Points } from 'three'
import type { DragState } from '../input/drag-state'
export function Particles({ count, drag }: { count: number; drag: RefObject<DragState> }) {
  const points = useRef<Points>(null)
  const seeds = useMemo(() => Float32Array.from({ length: count * 3 }, (_, i) => {
    const n = Math.sin(i * 127.1 + 311.7) * 43758.5453
    return (n - Math.floor(n) - .5) * (i % 3 === 0 ? 55 : i % 3 === 1 ? 24 : 60)
  }), [count])
  const positions = useMemo(() => seeds.slice(), [seeds])
  const t = useRef(0)
  useFrame((_, delta) => {
    if (!points.current) return
    t.current += Math.min(delta, .05)
    const attribute = points.current.geometry.attributes.position as BufferAttribute
    const handX = (drag.current.x / window.innerWidth - .5) * 26
    const handY = (.5 - drag.current.y / window.innerHeight) * 15
    for (let i = 0; i < count; i++) {
      const x = seeds[i * 3], y = seeds[i * 3 + 1]
      const force = Math.exp(-Math.hypot(x - handX, y - handY) * .4) * drag.current.energy
      attribute.setXYZ(i, x + Math.sin(t.current * .08 + i) * .3 + drag.current.vx * force, y + Math.sin(t.current * .12 + i) * .4 - drag.current.vy * force, seeds[i * 3 + 2] - 15)
    }
    attribute.needsUpdate = true
  })
  return <points ref={points} frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color="#d6dfe7" size={.025} transparent opacity={.6} depthWrite={false} />
  </points>
}
