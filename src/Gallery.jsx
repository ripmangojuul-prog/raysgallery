import React from 'react'
import { GALLERY } from './artworks.js'

const { width, height, startZ, endZ, wallX } = GALLERY
const length = startZ - endZ
const centerZ = (startZ + endZ) / 2

export function Gallery() {
  return (
    <group>
      {/* Floor — near-black, polished */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.12} metalness={0.92} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, centerZ]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#0C0C0C" roughness={0.95} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-wallX, height / 2, centerZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color="#141414" roughness={0.95} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[wallX, height / 2, centerZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color="#141414" roughness={0.95} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, height / 2, endZ]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#111111" roughness={0.95} />
      </mesh>

      {/* Entrance Wall */}
      <mesh position={[0, height / 2, startZ]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#111111" roughness={0.95} />
      </mesh>

      {/* Central ceiling beam — runs full length */}
      <mesh position={[0, height - 0.06, centerZ]}>
        <boxGeometry args={[0.08, 0.12, length]} />
        <meshStandardMaterial color="#0E0E0E" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Cross beams every ~5 units */}
      {Array.from({ length: Math.floor(length / 5) }, (_, i) => (
        <mesh key={`xbeam-${i}`} position={[0, height - 0.06, startZ - 2.5 - i * 5]}>
          <boxGeometry args={[width, 0.06, 0.06]} />
          <meshStandardMaterial color="#0E0E0E" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Subtle floor edge strips along walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-wallX + 0.15, 0.005, centerZ]}>
        <planeGeometry args={[0.08, length]} />
        <meshBasicMaterial color="#1A1A1A" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[wallX - 0.15, 0.005, centerZ]}>
        <planeGeometry args={[0.08, length]} />
        <meshBasicMaterial color="#1A1A1A" />
      </mesh>
    </group>
  )
}
