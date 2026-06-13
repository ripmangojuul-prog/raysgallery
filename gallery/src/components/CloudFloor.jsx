import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const MIST_COUNT = 2000
const MIST_SPREAD = 500
const MIST_WRAP = 250

/* ─── Procedural mist sprite texture ─── */
function createMistTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
  grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)')
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

/* ─── Build the cloud sea material with GLSL noise injection ─── */
function createCloudSeaMaterial(timeUniform) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.1,
  })

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = timeUniform

    // Prepend noise functions + varying to vertex shader
    shader.vertexShader = `
      uniform float uTime;
      varying float vElevation;

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                                + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x_) - 0.5;
        vec3 ox = floor(x_ + 0.5);
        vec3 a0 = x_ - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
    ` + shader.vertexShader

    // Inject vertex displacement after #include <begin_vertex>
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>

      float elevation = snoise(vec2(position.x * 0.015,
                                    position.z * 0.015 + uTime * 0.04)) * 4.0;
      elevation += snoise(vec2(position.x * 0.05 - uTime * 0.06,
                               position.z * 0.05)) * 1.5;
      elevation += snoise(vec2(position.x * 0.1,
                               position.z * 0.1 + uTime * 0.1)) * 0.5;

      transformed.y += elevation;
      vElevation = elevation;
      `
    )

    // Prepend varying declaration to fragment shader
    shader.fragmentShader = `
      varying float vElevation;
    ` + shader.fragmentShader

    // Inject elevation-based coloring
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>

      vec3 lowColor  = vec3(0.5, 0.6, 0.75);
      vec3 highColor = vec3(1.0, 1.0, 1.0);
      float mixRatio = smoothstep(-2.0, 4.0, vElevation);
      diffuseColor.rgb = mix(lowColor, highColor, mixRatio);
      `
    )
  }

  return mat
}

export default function CloudFloor() {
  const mistRef = useRef()
  const { camera } = useThree()

  // Shared time uniform drives the GLSL wave animation
  const timeUniform = useMemo(() => ({ value: 0 }), [])

  // System A: Rolling cloud sea — high-poly plane with GLSL vertex displacement
  const cloudSeaGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(800, 800, 256, 256)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  const cloudSeaMat = useMemo(() => createCloudSeaMaterial(timeUniform), [timeUniform])

  // System B: Volumetric mist particles
  const mistTexture = useMemo(() => createMistTexture(), [])

  const mistGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(MIST_COUNT * 3)
    for (let i = 0; i < MIST_COUNT * 3; i += 3) {
      positions[i]     = (Math.random() - 0.5) * MIST_SPREAD
      positions[i + 1] = (Math.random() * 8) - 1  // Y: -1 to 7
      positions[i + 2] = (Math.random() - 0.5) * MIST_SPREAD
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  const mistMat = useMemo(() => new THREE.PointsMaterial({
    size: 25,
    map: mistTexture,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: THREE.NormalBlending,
    color: 0xdae6f5,
  }), [mistTexture])

  useFrame((state, delta) => {
    // Drive the cloud sea wave animation
    timeUniform.value = state.clock.elapsedTime

    // Drift mist particles and wrap around the camera for infinite fog
    if (!mistRef.current) return
    const positions = mistRef.current.geometry.attributes.position.array
    const cx = camera.position.x
    const cz = camera.position.z

    for (let i = 0; i < MIST_COUNT * 3; i += 3) {
      positions[i]     += 0.4 * delta
      positions[i + 2] += 0.2 * delta

      if (positions[i]     > cx + MIST_WRAP) positions[i]     -= MIST_SPREAD
      if (positions[i]     < cx - MIST_WRAP) positions[i]     += MIST_SPREAD
      if (positions[i + 2] > cz + MIST_WRAP) positions[i + 2] -= MIST_SPREAD
      if (positions[i + 2] < cz - MIST_WRAP) positions[i + 2] += MIST_SPREAD
    }

    mistRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group>
      {/* Rolling cloud sea with GLSL Simplex Noise vertex displacement */}
      <mesh
        geometry={cloudSeaGeo}
        material={cloudSeaMat}
        position={[0, -2, -80]}
      />

      {/* Volumetric mist particles drifting around the player */}
      <points ref={mistRef} geometry={mistGeo} material={mistMat} />
    </group>
  )
}
