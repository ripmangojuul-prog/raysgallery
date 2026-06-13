// import React removed
import { Canvas } from '@react-three/fiber'
import { FlyControls, Stats } from '@react-three/drei'
import * as THREE from 'three'
import { Environment } from './Environment'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 6372600, 0], fov: 60, near: 10, far: 1000000 }}
        gl={{ toneMapping: THREE.NoToneMapping, antialias: false }}
      >
        <color attach="background" args={['#000000']} />
        <Environment />
        <FlyControls movementSpeed={100} rollSpeed={1} dragToLook />
        <Stats />
      </Canvas>
    </div>
  )
}

export default App
