import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Gallery from './components/Gallery'
import HUD from './components/HUD'

export default function App() {
  return (
    <>
      <Canvas
        camera={{ fov: 70, near: 0.1, far: 600, position: [0, 1.7, 12] }}
        gl={{
          antialias: true,
          toneMapping: 4,
          toneMappingExposure: 1.2,
        }}
        style={{ position: 'fixed', inset: 0 }}
      >
        <Suspense fallback={null}>
          <Gallery />
        </Suspense>
      </Canvas>
      <HUD />
    </>
  )
}
