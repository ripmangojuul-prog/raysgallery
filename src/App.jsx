import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from './Player.jsx'
import { Artwork } from './Artwork.jsx'
import { Gallery } from './Gallery.jsx'
import { ARTWORKS } from './artworks.js'

export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 3.5, 6], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.4
      }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 5, 30]} />

      {/* Very dim ambient — artworks are the only bright elements */}
      <ambientLight intensity={0.025} color="#1E1E1E" />

      <Gallery />
      <Player />

      <Suspense fallback={null}>
        {ARTWORKS.map((art) => (
          <Artwork key={art.id} {...art} />
        ))}
      </Suspense>
    </Canvas>
  )
}
