import { useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
function ridge(seed: number, depth: number) {
  const vertices: number[] = []
  for (let i = 0; i < 160; i++) {
    const x = i - 80
    const height = (n: number) => 2 + Math.pow(Math.sin(n * .056 + seed), 2) * 7 + Math.sin(n * .29 + seed) * .9 + Math.cos(n * 1.13) * .32
    vertices.push(x, -5, depth, x + 1, height(i + 1), depth, x, height(i), depth)
    vertices.push(x, -5, depth, x + 1, -5, depth, x + 1, height(i + 1), depth)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  return geometry
}
export function Terrain() {
  const far = useMemo(() => ridge(2, -65), [])
  const near = useMemo(() => ridge(5, -42), [])
  return <>
    <mesh geometry={far}><meshBasicMaterial color="#1b242d" /></mesh>
    <mesh geometry={near}><meshBasicMaterial color="#0d131a" /></mesh>
    <mesh position={[14, 14, -70]}><sphereGeometry args={[3.3, 32, 32]} /><meshBasicMaterial color="#cbd0d2" /></mesh>
    <mesh position={[14.8, 14.5, -69]}><sphereGeometry args={[3.15, 32, 32]} /><meshBasicMaterial color="#0b1119" /></mesh>
  </>
}
