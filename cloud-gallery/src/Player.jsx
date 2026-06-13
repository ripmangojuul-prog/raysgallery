import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from './store.js'
import { ARTWORKS, GALLERY } from './artworks.js'

const SPEED = 5
const PLAYER_Y = 1.2
const HOVER_AMP = 0.1
const HOVER_FREQ = 1.8

// Camera offset relative to player
const CAM_OFFSET_Y = 3.5
const CAM_OFFSET_Z = 6
const CAM_LOOK_Y = 1.2
const CAM_LOOK_Z = -2

export function Player() {
  const [, get] = useKeyboardControls()
  const meshRef = useRef()

  const camPos = useRef(new THREE.Vector3(0, CAM_OFFSET_Y, CAM_OFFSET_Z))
  const camLook = useRef(new THREE.Vector3(0, CAM_LOOK_Y, CAM_LOOK_Z))

  const setArtInRange = useStore((s) => s.setArtInRange)
  const prevArtId = useRef(null)

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const { lightboxArt, isMenuOpen } = useStore.getState()
    const locked = lightboxArt !== null || isMenuOpen

    // --- Movement ---
    if (!locked) {
      const { forward, backward, left, right } = get()

      const mx = (right ? 1 : 0) - (left ? 1 : 0)
      const mz = (backward ? 1 : 0) - (forward ? 1 : 0)

      if (mx !== 0 || mz !== 0) {
        const dir = new THREE.Vector3(mx, 0, mz).normalize()
        meshRef.current.position.x += dir.x * SPEED * delta
        meshRef.current.position.z += dir.z * SPEED * delta
      }

      // Clamp to gallery bounds
      meshRef.current.position.x = THREE.MathUtils.clamp(
        meshRef.current.position.x,
        -(GALLERY.wallX - 0.8),
        GALLERY.wallX - 0.8
      )
      meshRef.current.position.z = THREE.MathUtils.clamp(
        meshRef.current.position.z,
        GALLERY.endZ + 1.5,
        GALLERY.startZ - 1.5
      )
    }

    // --- Hovering animation ---
    meshRef.current.position.y = PLAYER_Y + Math.sin(state.clock.elapsedTime * HOVER_FREQ) * HOVER_AMP

    // --- Slow self-rotation ---
    meshRef.current.rotation.y += delta * 0.5
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.15

    // --- Proximity detection ---
    const px = meshRef.current.position.x
    const pz = meshRef.current.position.z
    const playerXZ = new THREE.Vector2(px, pz)

    let closest = null
    let closestDist = GALLERY.interactionRadius

    for (const art of ARTWORKS) {
      const d = playerXZ.distanceTo(new THREE.Vector2(art.position[0], art.position[2]))
      if (d < closestDist) {
        closestDist = d
        closest = art
      }
    }

    const newId = closest?.id ?? null
    if (newId !== prevArtId.current) {
      prevArtId.current = newId
      setArtInRange(closest)
    }

    // --- Camera follow ---
    camPos.current.set(px * 0.4, CAM_OFFSET_Y, pz + CAM_OFFSET_Z)
    camLook.current.set(px * 0.3, CAM_LOOK_Y, pz + CAM_LOOK_Z)

    state.camera.position.lerp(camPos.current, 3.5 * delta)
    state.camera.lookAt(camLook.current)
  })

  return (
    <group ref={meshRef} position={[0, PLAYER_Y, 0]}>
      {/* Obsidian shard avatar */}
      <mesh>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color="#0D0D0D"
          metalness={0.95}
          roughness={0.05}
          emissive="#1A1510"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Warm accent glow following the player */}
      <pointLight distance={5} intensity={1.5} color="#C4A882" decay={2} />
    </group>
  )
}
