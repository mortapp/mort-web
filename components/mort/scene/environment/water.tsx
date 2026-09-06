import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, ShaderMaterial, Vector2 } from 'three'
import type { DragState } from '../input/drag-state'
const vertexShader = `
  uniform float uTime;
  varying vec3 vWorld;
  void main() {
    vec3 p = position;
    p.z += sin(p.x * .48 + uTime * .48) * .12 + sin(p.y * .63 - uTime * .32) * .08;
    vec4 world = modelMatrix * vec4(p, 1.);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uEnergy;
  uniform vec3 uColor;
  varying vec3 vWorld;
  void main() {
    vec2 p = vWorld.xz;
    float w = sin(p.x * 1.8 + p.y * 2.5 + uTime * .65) * sin(p.y * 3.2 - uTime * .5);
    float fine = sin(p.y * 9. + sin(p.x * 3. + uTime) * .5);
    float lane = exp(-pow((p.x - 4.) / (1.2 + abs(p.y) * .075), 2.));
    float silver = pow(max(0., w * .5 + fine * .25 + .18), 5.) * lane;
    float distanceToHand = length(p - uPointer);
    float ripple = sin(distanceToHand * 5. - uTime * 5.) * exp(-distanceToHand * .25) * uEnergy;
    float broad = pow(max(0., sin(p.y*.8 + sin(p.x*.5+uTime*.4) - uTime*.9)), 12.) * lane;
    vec3 color = uColor + vec3(.6, .65, .7) * silver * 1.8 + vec3(.12,.19,.24)*broad + vec3(.4, .5, .6) * max(0., ripple);
    float fog = 1. - exp(-length(vWorld - cameraPosition) * .012);
    color = mix(color, vec3(.027, .035, .045), fog);
    gl_FragColor = vec4(color, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`
export function Water({ drag }: { drag: RefObject<DragState> }) {
  const material = useRef<ShaderMaterial>(null)
  const time = useRef(0)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPointer: { value: new Vector2() }, uEnergy: { value: 0 }, uColor: { value: new Color('#122732') } }), [])
  useFrame((_, dt) => {
    if (!material.current) return
    time.current += Math.min(dt, .05)
    material.current.uniforms.uTime.value = time.current
    material.current.uniforms.uEnergy.value = drag.current.energy
    material.current.uniforms.uPointer.value.set((drag.current.x / window.innerWidth - .5) * 30, (drag.current.y / window.innerHeight - .5) * 22)
  })
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, -20]}>
    <planeGeometry args={[160, 160, 90, 90]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
  </mesh>
}
