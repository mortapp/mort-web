import { useEffect, useMemo } from 'react'
import { PlaneGeometry } from 'three'
import type { SceneProfile } from '../profile'
function landscape(seed:number) {
  const g=new PlaneGeometry(150,24,180,28)
  g.rotateX(-Math.PI/2)
  const p=g.attributes.position
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i), envelope=Math.pow(Math.max(0,1-Math.abs(z)/13),.65)
    const h=3+Math.pow(Math.sin(x*.048+seed),2)*10+Math.sin(x*.27+z*.13)*1.2+Math.sin(x*1.04+z*.5)*.35
    p.setY(i,h*envelope-3)
  }
  g.computeVertexNormals();return g
}
export function Terrain({profile}:{profile:SceneProfile}) {
  const geometries=useMemo(()=>[landscape(2),landscape(5),landscape(8)],[])
  useEffect(()=>()=>geometries.forEach(g=>g.dispose()),[geometries])
  return <>
    {geometries.map((g,i)=><mesh key={i} geometry={g} scale={[1,profile==='safety'?.5:1,1]} position={[i*5,profile==='safety'?-4:0,-90+i*22]}><meshStandardMaterial color={['#52616a','#303f48','#17252d'][i]} roughness={.96} /></mesh>)}
    <mesh position={[profile==='safety'?-20:20,21,-105]}><sphereGeometry args={[3.6,32,24]} /><meshBasicMaterial color="#d8e0df" /></mesh>
    <mesh position={[profile==='safety'?-19:21.1,21.6,-104]}><sphereGeometry args={[3.45,32,24]} /><meshBasicMaterial color="#40505e" /></mesh>
  </>
}
