import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide, Group, Mesh, ShaderMaterial } from 'three'
import type { SceneProfile } from '../profile'
function WatchLight({x,z}:{x:number;z:number}){
  const pivot=useRef<Group>(null),t=useRef(0)
  useFrame((_,dt)=>{t.current+=Math.min(dt,.05);if(pivot.current)pivot.current.rotation.y=Math.sin(t.current*.18+x)*.6})
  return <group ref={pivot} position={[x,9,z]}>
    <mesh rotation={[0,0,Math.PI/2+.12]} position={[8,-1,0]}><coneGeometry args={[2,17,24,1,true]} /><meshBasicMaterial color="#c3e4f0" transparent opacity={.028} depthWrite={false} side={DoubleSide} blending={AdditiveBlending}/></mesh>
    <mesh><sphereGeometry args={[.16,12,8]} /><meshBasicMaterial color="#e0f5ff" /></mesh>
  </group>
}
function ArchiveLight(){
  const material=useRef<ShaderMaterial>(null)
  useFrame((_,dt)=>{if(material.current)material.current.uniforms.uTime.value+=Math.min(dt,.05)})
  return <mesh position={[0,0,.1]}><planeGeometry args={[2.3,13]}/><shaderMaterial ref={material} transparent depthWrite={false} blending={AdditiveBlending} uniforms={{uTime:{value:0}}} vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`uniform float uTime;varying vec2 vUv;void main(){float band=exp(-pow((vUv.y-fract(uTime*.12+vUv.x*.15))*12.,2.));float edge=pow(abs(vUv.x-.5)*2.,3.);gl_FragColor=vec4(.55,.8,1.,band*(.25+edge*.35));}`}/></mesh>
}
function Longship(){
  const hull=useRef<Group>(null), sail=useRef<Mesh>(null), t=useRef(0)
  useFrame((_,dt)=>{t.current+=Math.min(dt,.05); if(hull.current){ hull.current.position.y=Math.sin(t.current*1.1)*.12; hull.current.rotation.z=Math.sin(t.current*.7)*.018 } if(sail.current) sail.current.rotation.y=Math.sin(t.current*.35)*.06 })
  return <group ref={hull} position={[1.5,-.2,-7]} rotation={[0,.08,0]}>
    <mesh position={[0,0,0]} rotation={[0,0,Math.PI]}><capsuleGeometry args={[1.35,8,6,18]}/><meshStandardMaterial color="#172a35" metalness={.55} roughness={.32}/></mesh>
    <mesh position={[0,.7,0]}><boxGeometry args={[6.3,.16,.7]}/><meshStandardMaterial color="#b18a55" metalness={.2} roughness={.65}/></mesh>
    {[-2.4,-1.2,0,1.2,2.4].map(x=><mesh key={x} position={[x,.84,0]}><boxGeometry args={[.12,.18,.95]}/><meshStandardMaterial color="#d4aa6a"/></mesh>)}
    <mesh position={[0,3.6,0]}><cylinderGeometry args={[.11,.13,6,10]}/><meshStandardMaterial color="#87643f"/></mesh>
    <mesh ref={sail} position={[.85,3.65,0]} rotation={[0,0,-.08]}><planeGeometry args={[2.8,4.7,1,8]}/><meshStandardMaterial color="#d7d5c5" side={DoubleSide} roughness={.9}/></mesh>
    <mesh position={[0,6.65,0]}><sphereGeometry args={[.18,12,8]}/><meshBasicMaterial color="#bfe7f5"/></mesh>
    <mesh position={[0,.25,.92]} rotation={[0,0,0]}><boxGeometry args={[2.2,.06,.05]}/><meshBasicMaterial color="#d5ecf2" transparent opacity={.7}/></mesh>
  </group>
}
export function Structures({profile}:{profile:SceneProfile}){
  const orbit=useRef<Group>(null),t=useRef(0),glow=useRef<Mesh>(null)
  useFrame((_,dt)=>{t.current+=Math.min(dt,.05);if(orbit.current)orbit.current.rotation.z=t.current*.075;if(glow.current)glow.current.scale.setScalar(1+Math.sin(t.current*.8)*.07)})
  if(profile==='app')return null
  if(profile==='safety')return <group>
    {[0,1,2,3].map(i=><group key={i} position={[8,0,-12-i*13]}>
      {[-1,1].map(side=><group key={side} position={[side*(6+i*.8),0,0]}>
        <mesh position={[0,4,0]}><boxGeometry args={[1.25,14,2]} /><meshStandardMaterial color="#202e36" metalness={.5} roughness={.5}/></mesh>
        <mesh position={[-side*.66,4,.6]}><boxGeometry args={[.06,11,.08]} /><meshBasicMaterial color="#aecad5"/></mesh>
      </group>)}
      <mesh position={[0,10.8,0]}><boxGeometry args={[14+i*1.6,.65,2]} /><meshStandardMaterial color="#34434a" metalness={.5} roughness={.5}/></mesh>
    </group>)}
    <mesh position={[8,-2,-32]}><boxGeometry args={[7,.3,80]} /><meshStandardMaterial color="#40545c" metalness={.75} roughness={.3}/></mesh>
    {Array.from({length:14},(_,i)=><group key={i}>{[-1,1].map(s=><mesh key={s} position={[8+s*3.1,-1.65,8-i*5]}><boxGeometry args={[.08,.05,1.5]} /><meshBasicMaterial color="#c5dce4" /></mesh>)}</group>)}
    <WatchLight x={14} z={-12}/><WatchLight x={1} z={-38}/>
    <mesh ref={glow} position={[8,4,-58]}><sphereGeometry args={[.7,16,12]}/><meshBasicMaterial color="#e6f8ff" /></mesh>
  </group>
  if(profile==='legal')return <group position={[8,0,-10]}>{[0,1,2,3,4].map(i=><group key={i} position={[i*3-5,3,-i*4]}>
    <ArchiveLight/>
    <mesh><boxGeometry args={[2.3,13,.12]}/><meshPhysicalMaterial color="#94b1c1" transparent opacity={.16} metalness={.5} roughness={.1} side={DoubleSide}/></mesh>
    <mesh position={[-1.15,0,0]}><boxGeometry args={[.035,13,.15]}/><meshBasicMaterial color="#adccdc" /></mesh>
  </group>)}</group>
  if(profile==='auth')return <group>{Array.from({length:18},(_,i)=><group key={i} position={[i*3-26,0,-45-Math.sin(i)*5]}>
    <mesh position={[0,(i%5)*.6,0]}><boxGeometry args={[1.2,3+(i%5)*1.2,1.4]}/><meshStandardMaterial color="#15222d"/></mesh>
    <mesh position={[.2,1+(i%5)*.7,.8]}><boxGeometry args={[.08,.25,.05]}/><meshBasicMaterial color="#afcddd"/></mesh>
  </group>)}</group>
  return <group>
    <Longship />
    <group position={[21,4,-53]} rotation={[0,-.3,0]}>{[0,1,2].map(i=><group key={i} position={[i*4,0,-i*3]}>
      <mesh position={[0,2+i*2,0]}><cylinderGeometry args={[.35,1.1,14+i*4,6]} /><meshStandardMaterial color="#617888" metalness={.6} roughness={.4}/></mesh>
      <mesh position={[0,10+i*4,0]}><coneGeometry args={[.8,3,6]} /><meshStandardMaterial color="#bdcbd2" metalness={.7} roughness={.3}/></mesh>
      <mesh position={[0,4+i*2,.7]}><boxGeometry args={[.06,8,.08]} /><meshBasicMaterial color="#d0e6ef" /></mesh>
    </group>)}</group>
    <group ref={orbit} position={[4.5,2,-4]} rotation={[.6,.2,0]}>
      {[0,1].map(i=><mesh key={i} rotation={[1.1+i*.3,.4,0]}><torusGeometry args={[3.2+i*.4,.012,4,100,Math.PI*1.6]}/><meshBasicMaterial color="#c4dae4" transparent opacity={.5}/></mesh>)}
    </group>
  </group>
}
