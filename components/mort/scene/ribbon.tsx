import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import type { DragState } from './input/drag-state'
const LENGTH = 36
export function Ribbon({ drag }: { drag: RefObject<DragState> }) {
  const material = useRef<MeshBasicMaterial>(null)
  const mesh = useRef<Mesh>(null)
  const points = useMemo(() => Array.from({ length: LENGTH }, () => new Vector3()), [])
  const target = useMemo(() => new Vector3(), [])
  const started = useRef(false)
  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array((LENGTH - 1) * 18), 3))
    return g
  }, [])
  useFrame(({ camera }, delta) => {
    const s = drag.current
    target.set(s.x / window.innerWidth * 2 - 1, 1 - s.y / window.innerHeight * 2, .5).unproject(camera)
    target.sub(camera.position).normalize().multiplyScalar(12).add(camera.position)
    if (!started.current && s.energy > .01) { points.forEach(p => p.copy(target)); started.current = true }
    points[0].lerp(target, 1 - Math.exp(-24 * Math.min(delta, .05)))
    for (let i = 1; i < LENGTH; i++) points[i].lerp(points[i - 1], 1 - Math.exp(-28 * Math.min(delta, .05)))
    if (!mesh.current) return
    const attr = mesh.current.geometry.attributes.position as BufferAttribute
    for (let i = 0; i < LENGTH - 1; i++) {
      const a = points[i], b = points[i + 1]
      const width = .032 * (1 - i / LENGTH) * s.energy
      const j = i * 6
      attr.setXYZ(j, a.x, a.y + width, a.z); attr.setXYZ(j + 1, a.x, a.y - width, a.z); attr.setXYZ(j + 2, b.x, b.y + width, b.z)
      attr.setXYZ(j + 3, b.x, b.y + width, b.z); attr.setXYZ(j + 4, a.x, a.y - width, a.z); attr.setXYZ(j + 5, b.x, b.y - width, b.z)
    }
    attr.needsUpdate = true
    if (material.current) material.current.opacity = s.energy * .85
  })
  return <mesh ref={mesh} geometry={geometry} frustumCulled={false} renderOrder={5}><meshBasicMaterial ref={material} color="#e1edff" side={DoubleSide} transparent depthWrite={false} /></mesh>
}
