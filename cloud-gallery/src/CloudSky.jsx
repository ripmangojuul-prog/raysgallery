import React from 'react'
import { EffectComposer } from '@react-three/postprocessing'
import { Clouds, CloudLayer } from '@takram/three-clouds/r3f'
import { Atmosphere, AerialPerspective, Sky, SunLight } from '@takram/three-atmosphere/r3f'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function CloudSky() {
  const { scene } = useThree()
  
  // Add a dynamic fog to blend with the clouds when inside them
  React.useEffect(() => {
    scene.fog = new THREE.FogExp2('#d0e0f0', 0.003)
    return () => {
      scene.fog = null
    }
  }, [scene])

  return (
    <Atmosphere>
      <Sky />
      <SunLight position={[100, 50, -50]} intensity={1.5} />
      <EffectComposer enableNormalPass multisampling={0}>
        <Clouds disableDefaultLayers>
          {/* Ground-level fog/cloud layer */}
          <CloudLayer channel="r" altitude={0} height={50} densityScale={0.4} shapeAmount={1} shapeDetailAmount={1} />
          {/* High-altitude majestic clouds */}
          <CloudLayer channel="g" altitude={150} height={400} densityScale={0.8} />
        </Clouds>
        <AerialPerspective sky sunLight skyLight />
      </EffectComposer>
    </Atmosphere>
  )
}
