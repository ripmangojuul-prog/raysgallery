import React from 'react'
import { GALLERY } from './artworks.js'

const { width, startZ, endZ } = GALLERY
const length = startZ - endZ
const centerZ = (startZ + endZ) / 2

export function Gallery() {
  return (
    <group>
      {/* Floor — near-black, polished, floating platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.12} metalness={0.92} />
      </mesh>

      {/* Subtle floor edge strips along the long sides */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-width / 2 + 0.15, 0.005, centerZ]}>
        <planeGeometry args={[0.08, length]} />
        <meshBasicMaterial color="#1A1A1A" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2 - 0.15, 0.005, centerZ]}>
        <planeGeometry args={[0.08, length]} />
        <meshBasicMaterial color="#1A1A1A" />
      </mesh>

      {/* Cross beams under the floor for structural feel */}
      {Array.from({ length: Math.floor(length / 5) }, (_, i) => (
        <group key={`struct-${i}`}>
          {/* Under beam */}
          <mesh position={[0, -0.06, startZ - 2.5 - i * 5]}>
            <boxGeometry args={[width, 0.12, 0.12]} />
            <meshStandardMaterial color="#0E0E0E" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Left pillar */}
          <mesh position={[-width / 2 + 0.2, 2.5, startZ - 2.5 - i * 5]}>
            <boxGeometry args={[0.15, 5, 0.15]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Right pillar */}
          <mesh position={[width / 2 - 0.2, 2.5, startZ - 2.5 - i * 5]}>
            <boxGeometry args={[0.15, 5, 0.15]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
