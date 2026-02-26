import { Suspense, useMemo } from 'react'
import { Environment, Stars, Sparkles } from '@react-three/drei'
import DreamySky from './DreamySky'
import CloudFloor from './CloudFloor'
import ArtPieces from './ArtPieces'
import FirstPersonController from './FirstPersonController'

/**
 * Corridor lights — a few evenly spaced point lights along the gallery
 * instead of one per art piece (much better performance).
 */
function CorridorLights() {
  const lights = useMemo(() => {
    const arr = []
    // Place lights every ~17 units along the corridor (about 12 lights total)
    for (let z = 0; z >= -190; z -= 17) {
      arr.push(
        { key: `L${z}`, pos: [-4, 4.5, z], color: '#e0e0ff', intensity: 8 },
        { key: `R${z}`, pos: [4, 4.5, z], color: '#e0e0ff', intensity: 8 },
      )
    }
    return arr
  }, [])

  return (
    <>
      {lights.map((l) => (
        <pointLight
          key={l.key}
          position={l.pos}
          intensity={l.intensity}
          color={l.color}
          distance={25}
          decay={2}
        />
      ))}
    </>
  )
}

export default function Gallery() {
  return (
    <>
      {/* Bright ambient for dreamy feel */}
      <ambientLight intensity={0.8} color="#e0d8f0" />
      <directionalLight position={[10, 30, 10]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[-10, 20, -40]} intensity={0.35} color="#c0d0ff" />

      {/* Corridor lighting for artwork illumination */}
      <CorridorLights />

      {/* Soft fog that blends into the cloud floor / sky horizon */}
      <fog attach="fog" args={['#d0ddef', 40, 180]} />

      {/* Custom gradient sky sphere */}
      <DreamySky />

      {/* White cloud ground */}
      <CloudFloor />

      {/* Background stars (upper dark region) */}
      <Stars
        radius={350}
        depth={150}
        count={4000}
        factor={5}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Floating sparkles along the corridor */}
      <Sparkles
        count={300}
        scale={[20, 8, 200]}
        position={[0, 3, -80]}
        size={3}
        speed={0.2}
        opacity={0.5}
        color="#ffffff"
      />

      {/* Environment map for chrome reflections (not visible as background) */}
      <Environment preset="studio" background={false} environmentIntensity={1.5} />

      {/* All artwork with chrome frames */}
      <Suspense fallback={null}>
        <ArtPieces />
      </Suspense>

      {/* First-person movement + pointer lock */}
      <FirstPersonController />
    </>
  )
}
