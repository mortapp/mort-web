import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, Color, DoubleSide, Points, ShaderMaterial } from 'three'
import { SCENES, type SceneProfile } from '../profile'
import type { DragState } from '../input/drag-state'

const noise = `
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.03+7.1;a*=.5;}return v;}`
const vertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
export function Sky({ profile }: { profile: SceneProfile }) {
  const material = useRef<ShaderMaterial>(null), t = useRef(0)
  const uniforms = useMemo(() => ({ uTime:{value:0},uSky:{value:new Color(SCENES[profile].sky)},uHorizon:{value:new Color(SCENES[profile].horizon)} }), [profile])
  useFrame((_, dt) => { t.current += Math.min(dt,.05); if(material.current) material.current.uniforms.uTime.value=t.current })
  return <mesh position={[0,30,-130]}>
    <planeGeometry args={[350,180]} />
    <shaderMaterial ref={material} uniforms={uniforms} depthWrite={false} vertexShader={vertex} fragmentShader={`
      uniform float uTime;uniform vec3 uSky,uHorizon;varying vec2 vUv;${noise}
      void main(){vec2 p=vUv;float horizon=exp(-pow((p.y-.33)*5.,2.));
      vec3 col=mix(uSky*.22,uHorizon*.72,horizon);
      float cloud=fbm(vec2(p.x*7.-uTime*.022,p.y*13.+uTime*.007));
      float wisps=fbm(vec2(p.x*12.-uTime*.035,p.y*25.));
      col=mix(col,vec3(.04,.065,.09),smoothstep(.38,.72,cloud)*.72);
      col+=vec3(.2,.24,.28)*pow(max(0.,wisps-.38),2.)*horizon;
      float beam=exp(-pow((p.x-.64-(p.y-.4)*.28)*24.,2.));
      col+=vec3(.19,.22,.23)*beam*horizon;
      float cycle=mod(uTime,24.);float streak=exp(-pow((p.y-.64+(p.x-.55)*.34)*500.,2.))*exp(-pow((p.x-.72+cycle*.09)*18.,2.))*smoothstep(0.,.6,cycle)*(1.-smoothstep(3.,4.,cycle));
      col+=vec3(.45,.63,.8)*streak;
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`} />
  </mesh>
}
export function Mist({ profile, drag }: { profile: SceneProfile; drag: RefObject<DragState> }) {
  const material=useRef<ShaderMaterial>(null),t=useRef(0)
  const uniforms=useMemo(()=>({uTime:{value:0},uForce:{value:0},uColor:{value:new Color(SCENES[profile].mist)}}),[profile])
  useFrame((_,dt)=>{t.current+=Math.min(dt,.05);if(material.current){material.current.uniforms.uTime.value=t.current;material.current.uniforms.uForce.value=drag.current.energy}})
  return <mesh position={[0,1,-24]}>
    <planeGeometry args={[110,20]} />
    <shaderMaterial ref={material} transparent depthWrite={false} uniforms={uniforms} vertexShader={vertex} fragmentShader={`
      uniform float uTime,uForce;uniform vec3 uColor;varying vec2 vUv;${noise}
      void main(){vec2 p=vUv;float n=fbm(vec2(p.x*8.-uTime*.055-uForce*.7,p.y*7.));
      float band=exp(-pow((p.y-.3+sin(p.x*9.+uTime*.15)*.08)*4.8,2.));
      float alpha=smoothstep(.25,.75,n)*band*.23*(1.-uForce*.65);
      gl_FragColor=vec4(uColor,alpha);}`} />
  </mesh>
}
export function Weather({ profile, low, drag }: { profile: SceneProfile; low: boolean; drag: RefObject<DragState> }) {
  const rain=SCENES[profile].rain, count=low?90:profile==='app'?60:260
  const mesh=useRef<Points>(null),t=useRef(0)
  const seeds=useMemo(()=>Float32Array.from({length:count*3},(_,i)=>{const n=Math.sin(i*123.4+7.1)*43875.2;return n-Math.floor(n)}),[count])
  const positions=useMemo(()=>new Float32Array(count*3),[count])
  useFrame((_,dt)=>{
    t.current+=Math.min(dt,.05);if(!mesh.current)return
    const attr=mesh.current.geometry.attributes.position as BufferAttribute
    for(let i=0;i<count;i++){
      const a=seeds[i*3],b=seeds[i*3+1],c=seeds[i*3+2],speed=rain?5:.32+b*.5
      attr.setXYZ(i,((a*50+t.current*(rain?.4:.42)+drag.current.vx*.4)%50)-25,18-((b*24+t.current*speed)%24),-c*40+5)
    }attr.needsUpdate=true
  })
  return <points ref={mesh} frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} /></bufferGeometry>
    <shaderMaterial transparent depthWrite={false} blending={AdditiveBlending} uniforms={{uRain:{value:rain?1:0}}} vertexShader={`varying float vDepth;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vDepth=clamp(18./-p.z,.15,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(75./-p.z,1.,9.);}`} fragmentShader={`uniform float uRain;varying float vDepth;void main(){vec2 p=gl_PointCoord-.5;float a=uRain>.5?max(0.,1.-abs(p.x)*12.)*(1.-abs(p.y)*2.):smoothstep(.5,.05,length(p));gl_FragColor=vec4(.75,.85,.95,a*vDepth*.55);}`} />
  </points>
}
export function WindCloth({ drag, profile }: { drag: RefObject<DragState>; profile: SceneProfile }) {
  const mat=useRef<ShaderMaterial>(null),t=useRef(0)
  const uniforms=useMemo(()=>({uTime:{value:0},uForce:{value:0}}),[])
  useFrame((_,dt)=>{t.current+=Math.min(dt,.05);if(mat.current){mat.current.uniforms.uTime.value=t.current;mat.current.uniforms.uForce.value=drag.current.energy}})
  if(profile==='legal'||profile==='auth'||profile==='app')return null
  return <group position={[5,4,-7]} rotation={[.2,0,-.2]}>
    <mesh><planeGeometry args={[9,.5,70,3]} /><shaderMaterial ref={mat} side={DoubleSide} uniforms={uniforms} vertexShader={`uniform float uTime,uForce;varying vec2 vUv;varying float vShade;void main(){vUv=uv;vec3 p=position;float a=(.25+uv.x*.6)*(1.+uForce*2.);p.z+=sin(p.x*1.7-uTime*2.)*a;p.y+=sin(p.x*.8-uTime*1.4)*a*.6;vShade=p.z;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`} fragmentShader={`varying vec2 vUv;varying float vShade;void main(){vec3 c=mix(vec3(.15,.2,.25),vec3(.8,.85,.9),smoothstep(-.5,.5,vShade));gl_FragColor=vec4(c,1.);}`} /></mesh>
  </group>
}
