import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { ART_DATA, ART_WIDTH, ART_HEIGHT, FRAME_BORDER, FRAME_DEPTH } from '../artData'

/**
 * Shared frame geometry — created once, reused by all 51 frames.
 */
function buildFrameGeometry() {
  const fw = ART_WIDTH + FRAME_BORDER * 2
  const fh = ART_HEIGHT + FRAME_BORDER * 2

  const shape = new THREE.Shape()
  shape.moveTo(-fw / 2, -fh / 2)
  shape.lineTo(fw / 2, -fh / 2)
  shape.lineTo(fw / 2, fh / 2)
  shape.lineTo(-fw / 2, fh / 2)
  shape.lineTo(-fw / 2, -fh / 2)

  const hole = new THREE.Path()
  hole.moveTo(-ART_WIDTH / 2, -ART_HEIGHT / 2)
  hole.lineTo(ART_WIDTH / 2, -ART_HEIGHT / 2)
  hole.lineTo(ART_WIDTH / 2, ART_HEIGHT / 2)
  hole.lineTo(-ART_WIDTH / 2, ART_HEIGHT / 2)
  hole.lineTo(-ART_WIDTH / 2, -ART_HEIGHT / 2)
  shape.holes.push(hole)

  return new THREE.ExtrudeGeometry(shape, {
    depth: FRAME_DEPTH,
    bevelEnabled: false,
  })
}

/**
 * Shared chrome iridescent material — rainbow chrome shine matching the "Z" logo.
 */
function buildChromeMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: '#c8c8cc',
    metalness: 1,
    roughness: 0.04,
    iridescence: 1,
    iridescenceIOR: 2.2,
    iridescenceThicknessRange: [100, 600],
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.5,
    reflectivity: 1,
  })
}

function ArtPiece({ art, frameGeo, frameMat }) {
  const texture = useLoader(THREE.TextureLoader, art.src)

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
  }, [texture])

  // Frame sits slightly behind the art plane (toward the wall)
  const frameOffset = art.rotation[1] > 0
    ? [art.position[0] - 0.04, art.position[1], art.position[2]]
    : [art.position[0] + 0.04, art.position[1], art.position[2]]

  return (
    <group>
      <mesh position={art.position} rotation={art.rotation}>
        <planeGeometry args={[ART_WIDTH, ART_HEIGHT]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.4}
          metalness={0.0}
          toneMapped
        />
      </mesh>

      <mesh
        geometry={frameGeo}
        material={frameMat}
        position={frameOffset}
        rotation={art.rotation}
      />
    </group>
  )
}

export default function ArtPieces() {
  const frameGeo = useMemo(() => buildFrameGeometry(), [])
  const frameMat = useMemo(() => buildChromeMaterial(), [])

  return (
    <group>
      {ART_DATA.map((art) => (
        <ArtPiece key={art.id} art={art} frameGeo={frameGeo} frameMat={frameMat} />
      ))}
    </group>
  )
}
