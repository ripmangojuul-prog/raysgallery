import React, { useRef, useLayoutEffect } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from './store.js'

const ART_W = 2.5
const ART_H = 3.2

export function Artwork({ id, title, url, position, rotation, floorRing, barrierPos }) {
  const texture = useTexture(url)
  texture.colorSpace = THREE.SRGBColorSpace

  const lightRef = useRef()
  const targetRef = useRef()
  const isActive = useStore((s) => s.artInRange?.id === id)

  useLayoutEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
    }
  }, [])

  return (
    <group>
      {/* Artwork plane — flush to wall */}
      <group position={position} rotation={rotation}>
        <mesh>
          <planeGeometry args={[ART_W, ART_H]} />
          <meshStandardMaterial map={texture} roughness={0.85} color="#e6e6e6" />
        </mesh>

        {/* Dramatic spotlight targeting the artwork */}
        <spotLight
          ref={lightRef}
          position={[0, 3, 3.5]}
          angle={0.45}
          penumbra={0.75}
          intensity={180}
          color="#E8E4DF"
          distance={12}
          decay={2}
        />
        <object3D ref={targetRef} position={[0, 0, 0]} />
      </group>

      {/* Floor ring — outer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={floorRing}>
        <ringGeometry args={[0.4, 0.46, 48]} />
        <meshBasicMaterial
          color={isActive ? '#C4A882' : '#1E1E1E'}
          transparent
          opacity={isActive ? 0.85 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floor ring — inner dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={floorRing}>
        <ringGeometry args={[0.12, 0.16, 48]} />
        <meshBasicMaterial
          color={isActive ? '#C4A882' : '#1A1A1A'}
          transparent
          opacity={isActive ? 0.7 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Barrier / railing */}
      <Railing position={barrierPos} />
    </group>
  )
}

function Railing({ position }) {
  const len = 3.8
  const c = '#1A1A1A'

  return (
    <group position={position}>
      {/* Top rail */}
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[0.025, 0.025, len]} />
        <meshStandardMaterial color={c} metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Mid rail */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.025, 0.025, len]} />
        <meshStandardMaterial color={c} metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Posts */}
      {[-len / 2, 0, len / 2].map((z, i) => (
        <mesh key={i} position={[0, 0.45, z]}>
          <boxGeometry args={[0.025, 0.9, 0.025]} />
          <meshStandardMaterial color={c} metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
