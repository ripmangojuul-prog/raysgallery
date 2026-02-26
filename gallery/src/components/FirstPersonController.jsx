import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { gameState } from '../gameState'
import { CORRIDOR } from '../artData'
import useStore from '../store'

const SPEED = 14
const SPRINT_SPEED = 26
const ACCEL = 6        // lerp factor for smooth acceleration
const BOB_SPEED = 9    // head bob frequency
const BOB_AMOUNT = 0.04 // head bob amplitude

const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _input = new THREE.Vector3()
const _target = new THREE.Vector3()

export default function FirstPersonController() {
  const controlsRef = useRef()
  const { camera } = useThree()
  const velocity = useRef(new THREE.Vector3())
  const keys = useRef({})
  const setLocked = useStore((s) => s.setLocked)

  // Keyboard tracking
  useEffect(() => {
    const onDown = (e) => { keys.current[e.code] = true }
    const onUp = (e) => { keys.current[e.code] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // Pointer lock events
  useEffect(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return
    const onLock = () => setLocked(true)
    const onUnlock = () => {
      setLocked(false)
      // Clear keys on unlock to prevent stuck movement
      keys.current = {}
    }
    ctrl.addEventListener('lock', onLock)
    ctrl.addEventListener('unlock', onUnlock)
    return () => {
      ctrl.removeEventListener('lock', onLock)
      ctrl.removeEventListener('unlock', onUnlock)
    }
  }, [setLocked])

  useFrame((_, delta) => {
    const k = keys.current
    const isLocked = useStore.getState().isLocked
    if (!isLocked) {
      velocity.current.set(0, 0, 0)
      return
    }

    // Get camera forward and right projected onto XZ plane
    camera.getWorldDirection(_forward)
    _forward.y = 0
    _forward.normalize()

    _right.crossVectors(_forward, THREE.Object3D.DEFAULT_UP).normalize()

    // Gather input
    _input.set(0, 0, 0)
    if (k.KeyW || k.ArrowUp) _input.add(_forward)
    if (k.KeyS || k.ArrowDown) _input.sub(_forward)
    if (k.KeyD || k.ArrowRight) _input.add(_right)
    if (k.KeyA || k.ArrowLeft) _input.sub(_right)

    const moving = _input.lengthSq() > 0.001
    if (moving) _input.normalize()

    const speed = k.ShiftLeft || k.ShiftRight ? SPRINT_SPEED : SPEED
    _target.copy(_input).multiplyScalar(speed)

    // Smooth acceleration / deceleration
    velocity.current.lerp(_target, ACCEL * delta)

    // Apply movement
    camera.position.x += velocity.current.x * delta
    camera.position.z += velocity.current.z * delta

    // Head bob when moving
    if (moving) {
      gameState.bobTimer += delta * BOB_SPEED
      camera.position.y = CORRIDOR.eyeHeight + Math.sin(gameState.bobTimer) * BOB_AMOUNT
    } else {
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, CORRIDOR.eyeHeight, 5 * delta)
    }

    // Boundary clamp
    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x,
      -CORRIDOR.halfX,
      CORRIDOR.halfX
    )
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      CORRIDOR.endZ,
      CORRIDOR.startZ
    )

    // Update shared state
    gameState.position[0] = camera.position.x
    gameState.position[1] = camera.position.y
    gameState.position[2] = camera.position.z
    gameState.isMoving = moving
  })

  return <PointerLockControls ref={controlsRef} />
}
