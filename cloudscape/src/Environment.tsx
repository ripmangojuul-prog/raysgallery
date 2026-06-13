import { EffectComposer } from '@react-three/postprocessing'
import { Clouds, CloudLayer } from '@takram/three-clouds/r3f'
import { Atmosphere, AerialPerspective, Sky } from '@takram/three-atmosphere/r3f'
// import THREE removed

export const Environment = () => {
  // Use a fixed date so the sun is high in the sky
  const date = new Date('2025-06-21T12:00:00Z').getTime()
  return (
    <Atmosphere date={date}>
      <Sky />
      <EffectComposer enableNormalPass multisampling={0}>
        <Clouds disableDefaultLayers>
          <CloudLayer channel='r' altitude={750} height={650} />
          <CloudLayer channel='g' altitude={1000} height={1200} />
        </Clouds>
        <AerialPerspective sky sunLight skyLight />
      </EffectComposer>
    </Atmosphere>
  )
}

