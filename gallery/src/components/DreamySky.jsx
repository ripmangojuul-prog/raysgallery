import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Giant inverted sphere with a vertical gradient shader.
 * Matches the screenshot: white clouds at bottom → pale blue → deep blue → black at top.
 * Stars/sparkles are handled separately.
 */

const vertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float t = dir.y * 0.5 + 0.5; // 0 = bottom, 1 = top

    // Color stops matching the screenshot gradient
    vec3 c0 = vec3(0.92, 0.93, 0.95);   // warm white (cloud base)
    vec3 c1 = vec3(0.72, 0.80, 0.90);   // pale blue
    vec3 c2 = vec3(0.35, 0.45, 0.65);   // medium blue
    vec3 c3 = vec3(0.12, 0.14, 0.28);   // dark blue-purple
    vec3 c4 = vec3(0.02, 0.02, 0.05);   // near black

    vec3 color;
    if (t < 0.30) {
      color = mix(c0, c1, t / 0.30);
    } else if (t < 0.50) {
      color = mix(c1, c2, (t - 0.30) / 0.20);
    } else if (t < 0.70) {
      color = mix(c2, c3, (t - 0.50) / 0.20);
    } else {
      color = mix(c3, c4, (t - 0.70) / 0.30);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`

export default function DreamySky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    []
  )

  return (
    <mesh material={material}>
      <sphereGeometry args={[500, 64, 32]} />
    </mesh>
  )
}
