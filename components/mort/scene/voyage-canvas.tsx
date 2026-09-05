'use client'
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { CatmullRomCurve3, Group, Vector3 } from 'three'

function Path({ active, paused }: { active: number; paused: boolean }) {
  const ship = useRef<Group>(null)
  const position = useRef(active / 5)
  const invalidate = useThree(s => s.invalidate)
  const curve = useMemo(() => new CatmullRomCurve3([
    new Vector3(-5, 0, 0), new Vector3(-3, .25, -1.4), new Vector3(-1, 0, 1.2),
    new Vector3(1, .3, -1.5), new Vector3(3, 0, .5), new Vector3(5, .25, -1.4),
  ]), [])
  useEffect(() => invalidate(), [active, invalidate])
  useFrame((_, delta) => {
    if (paused) return
    const difference = active / 5 - position.current
    position.current += difference * (1 - Math.exp(-5 * Math.min(delta, .05)))
    if (ship.current) ship.current.position.copy(curve.getPoint(position.current))
    if (Math.abs(difference) > .0001) invalidate()
  })
  return <group>
    <mesh><tubeGeometry args={[curve, 96, .022, 6, false]} /><meshStandardMaterial color="#a9b9ca" metalness={.6} roughness={.3} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.48, 0]}><planeGeometry args={[15, 10]} /><meshStandardMaterial color="#0a0f17" metalness={.6} roughness={.36} transparent opacity={.75} /></mesh>
    {Array.from({ length: 6 }, (_, i) => <group key={i} position={curve.getPoint(i / 5)}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.23, .014, 6, 32]} /><meshBasicMaterial color={i <= active ? '#bbd8fb' : '#465365'} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[.1, .1, .1]} /><meshBasicMaterial color={i <= active ? '#fff' : '#687a91'} /></mesh>
    </group>)}
    <group ref={ship} position={curve.getPoint(active / 5)}><mesh scale={[.19, .6, .2]} position={[0, .3, 0]} rotation={[0, 0, -.2]}><octahedronGeometry /><meshStandardMaterial color="#eff4fa" metalness={.75} roughness={.18} /></mesh><pointLight intensity={4} distance={3} color="#c1dbff" /></group>
  </group>
}
export default function VoyageCanvas({ active, paused }: { active: number; paused: boolean }) {
  return <Canvas orthographic camera={{ position: [0, 6, 10], zoom: 65, near: .1, far: 100 }} frameloop="demand" dpr={1} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}>
    <FitCamera /><ambientLight intensity={1} /><directionalLight position={[-2, 4, 3]} intensity={3} /><Path active={active} paused={paused} />
  </Canvas>
}
function FitCamera() {
  const width = useThree(s => s.size.width)
  return <OrthographicCamera makeDefault position={[0, 6, 10]} zoom={width / 12} near={.1} far={100} onUpdate={camera => camera.lookAt(0, 0, 0)} />
}
