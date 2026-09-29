import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide, ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, ShaderMaterial, Shape } from 'three'
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
  const hull=useRef<Group>(null), sail=useRef<ShaderMaterial>(null), wake=useRef<Group>(null), t=useRef(0)
  const hullGeometry=useMemo(()=>{
    const shape=new Shape()
    shape.moveTo(-3.3,.08)
    shape.lineTo(3.3,.08)
    shape.quadraticCurveTo(2.9,-.7,1.7,-.98)
    shape.lineTo(-1.7,-.98)
    shape.quadraticCurveTo(-2.9,-.7,-3.3,.08)
    return new ExtrudeGeometry(shape,{depth:1.55,bevelEnabled:true,bevelSize:.12,bevelThickness:.1,bevelSegments:2,curveSegments:12})
  },[])
  useEffect(()=>()=>hullGeometry.dispose(),[hullGeometry])
  useFrame(({size},dt)=>{
    t.current+=Math.min(dt,.05)
    if(hull.current){hull.current.position.x=size.width<760?4.8:7;hull.current.position.y=-.7+Math.sin(t.current*1.05)*.12;hull.current.rotation.z=Math.sin(t.current*.72)*.018}
    if(sail.current)sail.current.uniforms.uTime.value=t.current
    wake.current?.children.forEach((child,i)=>{
      const phase=(t.current*.35+i/3)%1
      child.scale.setScalar(1+phase*2.4)
      ;((child as Mesh).material as MeshBasicMaterial).opacity=(1-phase)*.28
    })
  })
  return <group ref={hull} position={[7,-.7,-9]} rotation={[0,-.08,0]}>
    <mesh geometry={hullGeometry} position={[0,0,-.78]}><meshStandardMaterial color="#284257" metalness={.22} roughness={.56} flatShading /></mesh>
    {[-.94,.94].map(z=><mesh key={z} position={[0,.16,z]}><boxGeometry args={[6.1,.13,.09]}/><meshStandardMaterial color="#d7a779" metalness={.18} roughness={.57}/></mesh>)}
    {[-2.55,-1.3,0,1.3,2.55].map(x=><mesh key={x} position={[x,.27,0]}><boxGeometry args={[.12,.2,1.7]}/><meshStandardMaterial color="#b98761" roughness={.7}/></mesh>)}
    <mesh position={[0,2.9,0]}><cylinderGeometry args={[.085,.11,5.7,8]}/><meshStandardMaterial color="#8b654a" roughness={.72}/></mesh>
    <mesh position={[1.75,3.22,.09]}><planeGeometry args={[3.5,4.75,24,20]}/><shaderMaterial ref={sail} side={DoubleSide} uniforms={{uTime:{value:0}}} vertexShader={`uniform float uTime;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float fill=sin(uv.y*3.14159);p.z+=sin(uv.x*3.5-uTime*1.8)*(.08+uv.x*.38)*fill;p.x+=sin(uTime*.8+uv.y*3.)*uv.x*.1;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`} fragmentShader={`uniform float uTime;varying vec2 vUv;void main(){if(vUv.x>1.-vUv.y*.82)discard;float fold=sin(vUv.x*18.-uTime*.45)*.045;vec3 linen=mix(vec3(.7,.51,.43),vec3(1.,.94,.78),vUv.y*.72+fold+.2);gl_FragColor=vec4(linen,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }`} /></mesh>
    <mesh position={[0,5.88,0]}><sphereGeometry args={[.17,10,8]}/><meshBasicMaterial color="#ffe3ae"/></mesh>
    <group ref={wake} position={[-1.5,-1.22,0]}>{[0,1,2].map(i=><mesh key={i} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.72,.76,48]}/><meshBasicMaterial color="#ffe6c1" transparent opacity={.2} depthWrite={false} side={DoubleSide}/></mesh>)}</group>
  </group>
}
export function Structures({profile}:{profile:SceneProfile}){
  const t=useRef(0),glow=useRef<Mesh>(null)
  useFrame((_,dt)=>{t.current+=Math.min(dt,.05);if(glow.current)glow.current.scale.setScalar(1+Math.sin(t.current*.8)*.07)})
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
    <group position={[24,2,-58]}>
      <mesh position={[0,6,0]}><cylinderGeometry args={[.7,1.6,13,8]}/><meshStandardMaterial color="#677b89" metalness={.15} roughness={.9} flatShading/></mesh>
      <mesh position={[0,13,0]}><cylinderGeometry args={[1.05,.8,1.2,8]}/><meshBasicMaterial color="#f9c29b"/></mesh>
      <mesh position={[0,14.7,0]}><coneGeometry args={[1.5,2.1,8]}/><meshStandardMaterial color="#31465c" roughness={.8}/></mesh>
      <pointLight position={[0,13,0]} intensity={18} distance={15} color="#ffd3a1"/>
    </group>
  </group>
}
