import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
export function Beacon({ quiet }: { quiet: boolean }) {
  const group = useRef<Group>(null)
  const time = useRef(0)
  useFrame((_, delta) => {
    if (!group.current) return
    time.current += Math.min(delta, .05)
    group.current.rotation.y = -.35 + Math.sin(time.current * .28) * .25
    group.current.rotation.z = -.17 + Math.sin(time.current * .32) * .04
    group.current.position.y = (quiet ? 1 : 2) + Math.sin(time.current * .65) * .15
  })
  return <group ref={group} position={[4.5, quiet ? 1 : 2, -3]} scale={quiet ? .8 : 1}>
    <mesh rotation={[.12, .15, 0]}>
      <torusGeometry args={[2.2, .16, 8, 6]} />
      <meshStandardMaterial color="#c7cbd1" metalness={.92} roughness={.23} />
    </mesh>
    <mesh rotation={[.12, .15, 0]} scale={1.12}>
      <torusGeometry args={[2.2, .012, 4, 6]} />
      <meshBasicMaterial color="#8795a6" />
    </mesh>
    <mesh scale={[.72, 2.45, .55]} rotation={[0, .4, 0]}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial color="#d7dce2" metalness={.78} roughness={.16} clearcoat={1} clearcoatRoughness={.12} />
    </mesh>
    <mesh position={[0, 0, .7]} scale={[.025, 2.1, .025]}>
      <octahedronGeometry args={[1, 0]} /><meshBasicMaterial color="#f4f6fc" />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -4.1, 0]}>
      <ringGeometry args={[1.9, 1.915, 80]} /><meshBasicMaterial color="#58697a" transparent opacity={.5} />
    </mesh>
  </group>
}
