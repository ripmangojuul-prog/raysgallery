import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl'
import { useEffect, useRef } from 'react'

import './CircularGallery.css'

// ——————————————————————————————————————————————————————————————
// CircularGallery — a curved WebGL ring of the artwork.
//
// Adapted from the React Bits component for embedding inside the HINTER
// single-page site. Three changes matter relative to the upstream source:
//   1. Pointer + resize listeners are scoped to the container, never `window`,
//      so the gallery never hijacks page scroll or steals drags from the rest
//      of the page.
//   2. A slow auto-drift keeps the ring alive without interaction, and pauses
//      while the visitor is dragging.
//   3. Clicking a plate (a press that didn't turn into a drag) hit-tests the
//      canvas and reports the original plate index, so it can open the existing
//      lightbox.
// `prefers-reduced-motion` disables the drift and the ambient shader ripple.
// ——————————————————————————————————————————————————————————————

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance)
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance)
    }
  })
}

const DEFAULT_FONT = 'bold 30px Figtree'
const DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&display=swap'

function deriveFontFamilyFromUrl(url) {
  const fileName = (url.split('/').pop() || 'custom-font').split('?')[0]
  const base = fileName.replace(/\.(woff2?|ttf|otf|eot)$/i, '')
  return base.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'CircularGalleryFont'
}

async function loadFontFromStylesheet(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch font stylesheet (${response.status})`)
  const cssText = await response.text()
  const faceBlocks = cssText.match(/@font-face\s*{[^}]*}/g) || []
  let family = null
  const fontFaces = []
  for (const block of faceBlocks) {
    const familyMatch = block.match(/font-family:\s*['"]?([^;'"]+)['"]?/)
    const urlMatch = block.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/)
    if (!familyMatch || !urlMatch) continue
    family = familyMatch[1].trim()
    const descriptors = {}
    const weightMatch = block.match(/font-weight:\s*([^;]+);/)
    const styleMatch = block.match(/font-style:\s*([^;]+);/)
    const rangeMatch = block.match(/unicode-range:\s*([^;]+);/)
    if (weightMatch) descriptors.weight = weightMatch[1].trim()
    if (styleMatch) descriptors.style = styleMatch[1].trim()
    if (rangeMatch) descriptors.unicodeRange = rangeMatch[1].trim()
    fontFaces.push(new FontFace(family, `url(${urlMatch[1]})`, descriptors))
  }
  if (!family) throw new Error('No @font-face rule found in the stylesheet')
  await Promise.allSettled(
    fontFaces.map(async (face) => {
      await face.load()
      document.fonts.add(face)
    }),
  )
  return family
}

async function loadFontFromFile(url) {
  const family = deriveFontFamilyFromUrl(url)
  const fontFace = new FontFace(family, `url(${url})`)
  await fontFace.load()
  document.fonts.add(fontFace)
  return family
}

async function loadCustomFont(fontUrl) {
  const isStylesheet = fontUrl.includes('fonts.googleapis.com') || /\.css(\?.*)?$/i.test(fontUrl)
  return isStylesheet ? loadFontFromStylesheet(fontUrl) : loadFontFromFile(fontUrl)
}

async function resolveFont(font, fontUrl) {
  const effectiveUrl = fontUrl || (font === DEFAULT_FONT ? DEFAULT_FONT_URL : null)
  if (!effectiveUrl) {
    if (document.fonts && document.fonts.load) {
      try {
        await document.fonts.load(font)
        await document.fonts.ready
      } catch {
        // Ignore — fall back to whatever the browser provides.
      }
    }
    return font
  }
  try {
    const family = await loadCustomFont(effectiveUrl)
    const sizeMatch = font.match(/^\s*(.*?\d+px)/)
    const prefix = sizeMatch ? sizeMatch[1].trim() : 'bold 30px'
    const resolved = `${prefix} "${family}"`
    if (document.fonts && document.fonts.load) {
      try {
        await document.fonts.load(resolved)
      } catch {
        // Ignore — we still attempt to render with the requested font.
      }
    }
    return resolved
  } catch (error) {
    console.error('CircularGallery: unable to load font from', fontUrl, error)
    return font
  }
}

function getFontSize(font) {
  const match = font.match(/(\d+)px/)
  return match ? parseInt(match[1], 10) : 30
}

function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = font
  const metrics = context.measureText(text)
  const textWidth = Math.ceil(metrics.width)
  const textHeight = Math.ceil(getFontSize(font) * 1.2)
  canvas.width = textWidth + 20
  canvas.height = textHeight + 20
  context.font = font
  context.fillStyle = color
  context.textBaseline = 'middle'
  context.textAlign = 'center'
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillText(text, canvas.width / 2, canvas.height / 2)
  const texture = new Texture(gl, { generateMipmaps: false })
  texture.image = canvas
  return { texture, width: canvas.width, height: canvas.height }
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }) {
    autoBind(this)
    this.gl = gl
    this.plane = plane
    this.renderer = renderer
    this.text = text
    this.textColor = textColor
    this.font = font
    this.createMesh()
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor)
    const geometry = new Plane(this.gl)
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    })
    this.mesh = new Mesh(this.gl, { geometry, program })
    const aspect = width / height
    const textHeight = this.plane.scale.y * 0.15
    const textWidth = textHeight * aspect
    this.mesh.scale.set(textWidth, textHeight, 1)
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05
    this.mesh.setParent(this.plane)
  }
  destroy() {
    if (this.mesh) this.mesh.setParent(null)
  }
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    itemIndex,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    timeStep = 0.04,
  }) {
    this.extra = 0
    this.geometry = geometry
    this.gl = gl
    this.image = image
    this.index = index
    this.itemIndex = itemIndex // index into the original (un-doubled) item list
    this.length = length
    this.renderer = renderer
    this.scene = scene
    this.screen = screen
    this.text = text
    this.viewport = viewport
    this.bend = bend
    this.textColor = textColor
    this.borderRadius = borderRadius
    this.font = font
    this.timeStep = timeStep
    this.createShader()
    this.createMesh()
    this.createTitle()
    this.onResize()
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true })
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * (this.index / Math.max(this.length, 1)) },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    })
    const img = new Image()
    this.img = img
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Guard against a load that resolves after this Media was destroyed.
      if (this.destroyed) return
      texture.image = img
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight]
    }
    img.onerror = () => {
      // Leave the plate transparent rather than throwing on a missing image.
    }
    img.src = this.image
  }
  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program })
    this.plane.setParent(this.scene)
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    })
  }
  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra

    const x = this.plane.position.x
    const H = this.viewport.width / 2

    if (this.bend === 0) {
      this.plane.position.y = 0
      this.plane.rotation.z = 0
    } else {
      const B_abs = Math.abs(this.bend)
      const R = (H * H + B_abs * B_abs) / (2 * B_abs)
      const effectiveX = Math.min(Math.abs(x), H)
      // Clamp against floating-point underflow making the discriminant < 0 (→ NaN).
      const arc = R - Math.sqrt(Math.max(0, R * R - effectiveX * effectiveX))
      if (this.bend > 0) {
        this.plane.position.y = -arc
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R)
      } else {
        this.plane.position.y = arc
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R)
      }
    }

    this.speed = scroll.current - scroll.last
    this.program.uniforms.uTime.value += this.timeStep
    this.program.uniforms.uSpeed.value = this.speed

    const planeOffset = this.plane.scale.x / 2
    const viewportOffset = this.viewport.width / 2
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal
      this.isBefore = this.isAfter = false
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal
      this.isBefore = this.isAfter = false
    }
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen
    if (viewport) {
      this.viewport = viewport
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height]
      }
    }
    this.scale = this.screen.height / 1500
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y]
    this.padding = 2
    this.width = this.plane.scale.x + this.padding
    this.widthTotal = this.width * this.length
    this.x = this.width * this.index
  }
  destroy() {
    this.destroyed = true
    if (this.img) {
      // Abort the in-flight fetch and detach the closure so a late load can't
      // touch a torn-down program.
      this.img.onload = null
      this.img.onerror = null
      this.img.src = ''
      this.img = null
    }
    if (this.title) this.title.destroy()
    if (this.plane) this.plane.setParent(null)
  }
}

class App {
  constructor(
    container,
    {
      items,
      bend,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05,
      autoScroll = 0,
      onItemClick = null,
    } = {},
  ) {
    this.container = container
    this.scrollSpeed = scrollSpeed
    this.autoScroll = autoScroll
    this.onItemClick = onItemClick
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0, position: 0 }
    this.isDown = false
    this.createRenderer()
    this.createCamera()
    this.createScene()
    this.onResize()
    this.createGeometry()
    this.createMedias(items, bend, textColor, borderRadius, font)
    this.boundUpdate = this.update.bind(this)
    this.update()
    this.addEventListeners()
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)
    this.canvas = this.gl.canvas
    this.container.appendChild(this.canvas)
  }
  createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.fov = 45
    this.camera.position.z = 20
  }
  createScene() {
    this.scene = new Transform()
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 })
  }
  createMedias(items, bend = 1, textColor, borderRadius, font) {
    const galleryItems = items && items.length ? items : []
    // Double the list so the ring can wrap seamlessly. Each copy keeps the
    // original item's index so a click maps back to the right plate.
    this.mediasImages = galleryItems.concat(galleryItems)
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        itemIndex: typeof data.index === 'number' ? data.index : index % galleryItems.length,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        timeStep: this.reducedMotion ? 0 : 0.04,
      })
    })
  }

  // —— Pointer interaction (scoped to the container) ——
  relX(e) {
    const rect = this.container.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    return clientX - rect.left
  }
  onPointerDown(e) {
    this.isDown = true
    this.moved = false
    this.scroll.position = this.scroll.current
    this.start = this.relX(e)
    this.startY = e.touches ? e.touches[0].clientY : e.clientY
    if (this.canvas.setPointerCapture && e.pointerId != null) {
      try {
        this.canvas.setPointerCapture(e.pointerId)
      } catch {
        // capture is best-effort
      }
    }
  }
  onPointerMove(e) {
    if (!this.isDown) return
    const x = this.relX(e)
    const distance = (this.start - x) * (this.scrollSpeed * 0.025)
    if (Math.abs(this.start - x) > 4) this.moved = true
    this.scroll.target = this.scroll.position + distance
  }
  onPointerUp(e) {
    if (!this.isDown) return
    this.isDown = false
    if (this.canvas.releasePointerCapture && e && e.pointerId != null) {
      try {
        this.canvas.releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    }
    // Only a real pointerup that never became a drag counts as a click —
    // pointercancel/pointerleave must not open a plate.
    if (e.type === 'pointerup' && !this.moved && this.onItemClick) {
      const rect = this.container.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const hit = this.mediaAtPoint(cx, cy)
      if (hit) this.onItemClick(hit.itemIndex)
    }
  }
  // Map a container-relative pixel point to the plate under it (AABB test in
  // screen space; rotation is ignored, which is plenty accurate for a click).
  mediaAtPoint(cx, cy) {
    const Wv = this.viewport.width
    const Hv = this.viewport.height
    const Ws = this.screen.width
    const Hs = this.screen.height
    let best = null
    let bestDx = Infinity
    for (const m of this.medias) {
      const sx = (m.plane.position.x / Wv + 0.5) * Ws
      const sy = (0.5 - m.plane.position.y / Hv) * Hs
      const hx = (m.plane.scale.x / 2 / Wv) * Ws
      const hy = (m.plane.scale.y / 2 / Hv) * Hs
      if (cx >= sx - hx && cx <= sx + hx && cy >= sy - hy && cy <= sy + hy) {
        const dx = Math.abs(cx - sx)
        if (dx < bestDx) {
          bestDx = dx
          best = m
        }
      }
    }
    return best
  }

  onResize() {
    const cw = this.container.clientWidth
    const ch = this.container.clientHeight
    // Skip degenerate sizes (container not laid out yet / hidden) — the
    // ResizeObserver fires again once the container has real dimensions.
    if (!cw || !ch) return
    this.screen = { width: cw, height: ch }
    this.renderer.setSize(this.screen.width, this.screen.height)
    this.camera.perspective({ aspect: this.screen.width / this.screen.height })
    const fov = (this.camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect
    this.viewport = { width, height }
    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }))
    }
  }
  update() {
    // Slow, living drift — paused while the visitor is dragging, and off
    // entirely when the visitor prefers reduced motion.
    if (!this.isDown && this.autoScroll && !this.reducedMotion) {
      this.scroll.target += this.autoScroll
    }
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease)
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left'
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction))
    }
    this.renderer.render({ scene: this.scene, camera: this.camera })
    this.scroll.last = this.scroll.current
    this.raf = window.requestAnimationFrame(this.boundUpdate)
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this)
    this.boundOnPointerDown = this.onPointerDown.bind(this)
    this.boundOnPointerMove = this.onPointerMove.bind(this)
    this.boundOnPointerUp = this.onPointerUp.bind(this)
    window.addEventListener('resize', this.boundOnResize)
    // A ResizeObserver keeps the canvas correctly sized regardless of *when*
    // the container gets its dimensions (reveal animations, late layout, font
    // resolution finishing before first paint) — window 'resize' alone misses
    // these and can leave the gallery blank.
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.onResize())
      this.resizeObserver.observe(this.container)
    }
    // Everything else is bound to the canvas so the gallery never interferes
    // with scrolling or interaction elsewhere on the page.
    this.canvas.addEventListener('pointerdown', this.boundOnPointerDown)
    this.canvas.addEventListener('pointermove', this.boundOnPointerMove)
    this.canvas.addEventListener('pointerup', this.boundOnPointerUp)
    this.canvas.addEventListener('pointercancel', this.boundOnPointerUp)
    this.canvas.addEventListener('pointerleave', this.boundOnPointerUp)
  }
  destroy() {
    window.cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.boundOnResize)
    if (this.resizeObserver) this.resizeObserver.disconnect()
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundOnPointerDown)
      this.canvas.removeEventListener('pointermove', this.boundOnPointerMove)
      this.canvas.removeEventListener('pointerup', this.boundOnPointerUp)
      this.canvas.removeEventListener('pointercancel', this.boundOnPointerUp)
      this.canvas.removeEventListener('pointerleave', this.boundOnPointerUp)
    }
    // Detach each plate (aborts pending image loads, removes meshes from the scene).
    if (this.medias) {
      this.medias.forEach((m) => m.destroy())
      this.medias = null
    }
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas)
    }
    // Release the WebGL context so repeated mounts (StrictMode/HMR) don't pile
    // up contexts and hit the browser's per-page limit.
    const loseCtx = this.gl && this.gl.getExtension('WEBGL_lose_context')
    if (loseCtx) loseCtx.loseContext()
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  fontUrl,
  scrollSpeed = 2,
  scrollEase = 0.05,
  autoScroll = 0,
  onItemClick,
}) {
  const containerRef = useRef(null)
  useEffect(() => {
    if (!containerRef.current) return
    let app
    let isMounted = true
    resolveFont(font, fontUrl).then((resolvedFont) => {
      if (!isMounted || !containerRef.current) return
      app = new App(containerRef.current, {
        items,
        bend,
        textColor,
        borderRadius,
        font: resolvedFont,
        scrollSpeed,
        scrollEase,
        autoScroll,
        onItemClick,
      })
    })
    return () => {
      isMounted = false
      if (app) app.destroy()
    }
  }, [items, bend, textColor, borderRadius, font, fontUrl, scrollSpeed, scrollEase, autoScroll, onItemClick])
  return <div className="circular-gallery" ref={containerRef} />
}
