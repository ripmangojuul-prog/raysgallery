import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from './Player.jsx'
import { Artwork } from './Artwork.jsx'
import { Gallery } from './Gallery.jsx'
import { ARTWORKS } from './artworks.js'
import { CloudSky } from './CloudSky.jsx'

export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 3.5, 6], fov: 35, near: 0.1, far: 2000 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
      }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      {/* We use Atmosphere for the sky/background now */}
      <ambientLight intensity={0.2} color="#FFFFFF" />

      <CloudSky />
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
