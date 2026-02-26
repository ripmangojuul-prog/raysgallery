import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * White cloud ground plane the player walks on.
 * Multiple layered planes with varying opacity create depth.
 * The fog blends edges into the sky horizon seamlessly.
 */
export default function CloudFloor() {
  const baseMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f0f0f5',
        roughness: 1,
        metalness: 0,
      }),
    []
  )

  const wispMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.6,
      }),
    []
  )

  const glowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e8e8ff',
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.25,
      }),
    []
  )

  return (
    <group>
      {/* Solid base layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, -80]} material={baseMat}>
        <planeGeometry args={[600, 600]} />
      </mesh>

      {/* Wispy middle layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -80]} material={wispMat}>
        <planeGeometry args={[600, 600]} />
      </mesh>

      {/* Top glow layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, -80]} material={glowMat}>
        <planeGeometry args={[500, 500]} />
      </mesh>
    </group>
  )
}
