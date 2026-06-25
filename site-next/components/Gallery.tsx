'use client';

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

// Curved WebGL ring of the artwork, ported from the live site. Listeners are
// scoped to the container (never window), there is a full WebGL teardown, the
// arc math is NaN-guarded, and drift + ripple honor prefers-reduced-motion.
// Change vs the original: the canvas plate labels use a system serif (Georgia)
// instead of fetching a font from a CDN, so there is no third-party round-trip.

type GalleryItem = { image: string; text: string; index: number };

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font: string) {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(gl: any, text: string, font: string, color: string) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(getFontSize(font) * 1.4);
  canvas.width = textWidth + 24;
  canvas.height = textHeight + 24;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  gl: any;
  plane: any;
  text: string;
  textColor: string;
  font: string;
  mesh: any;
  constructor({ gl, plane, text, textColor, font }: any) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
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
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.13;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
  destroy() {
    if (this.mesh) this.mesh.setParent(null);
  }
}

class Media {
  extra = 0;
  destroyed = false;
  geometry: any;
  gl: any;
  image: string;
  index: number;
  itemIndex: number;
  length: number;
  scene: any;
  screen: any;
  text: string;
  viewport: any;
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
  timeStep: number;
  program: any;
  plane: any;
  title: any;
  img: any;
  speed = 0;
  scale = 1;
  padding = 2;
  width = 0;
  widthTotal = 0;
  x = 0;
  isBefore = false;
  isAfter = false;

  constructor({
    geometry, gl, image, index, itemIndex, length, scene, screen, text, viewport,
    bend, textColor, borderRadius = 0, font, timeStep = 0.04,
  }: any) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.itemIndex = itemIndex;
    this.length = length;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.timeStep = timeStep;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
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
    });
    const img = new Image();
    this.img = img;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (this.destroyed) return;
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
    img.onerror = () => {};
    img.src = this.image;
  }
  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    });
  }
  update(scroll: any, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(Math.max(0, R * R - effectiveX * effectiveX));
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }
    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += this.timeStep;
    this.program.uniforms.uSpeed.value = this.speed;
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
  destroy() {
    this.destroyed = true;
    if (this.img) {
      this.img.onload = null;
      this.img.onerror = null;
      this.img.src = '';
      this.img = null;
    }
    if (this.title) this.title.destroy();
    if (this.plane) this.plane.setParent(null);
  }
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  autoScroll: number;
  onItemClick: ((i: number) => void) | null;
  reducedMotion: boolean;
  scroll = { ease: 0.05, current: 0, target: 0, last: 0, position: 0 };
  isDown = false;
  moved = false;
  start = 0;
  startY = 0;
  renderer: any;
  gl: any;
  canvas: any;
  camera: any;
  scene: any;
  planeGeometry: any;
  medias: Media[] | null = null;
  mediasImages: any[] = [];
  screen: any;
  viewport: any;
  raf = 0;
  boundUpdate: any;
  boundOnResize: any;
  boundOnPointerDown: any;
  boundOnPointerMove: any;
  boundOnPointerUp: any;
  resizeObserver?: ResizeObserver;

  constructor(container: HTMLElement, opts: any = {}) {
    const {
      items, bend, textColor = '#ffffff', borderRadius = 0, font = '500 30px Georgia',
      scrollSpeed = 2, scrollEase = 0.05, autoScroll = 0, onItemClick = null,
    } = opts;
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.autoScroll = autoScroll;
    this.onItemClick = onItemClick;
    this.reducedMotion =
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.scroll.ease = scrollEase;
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.boundUpdate = this.update.bind(this);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.canvas = this.gl.canvas;
    this.canvas.style.cursor = 'grab';
    this.container.appendChild(this.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
  }
  createMedias(items: GalleryItem[], bend = 1, textColor: string, borderRadius: number, font: string) {
    const galleryItems = items && items.length ? items : [];
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        itemIndex: typeof data.index === 'number' ? data.index : index % galleryItems.length,
        length: this.mediasImages.length,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        timeStep: this.reducedMotion ? 0 : 0.04,
      });
    });
  }
  relX(e: any) {
    const rect = this.container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return clientX - rect.left;
  }
  onPointerDown(e: any) {
    this.isDown = true;
    this.moved = false;
    this.scroll.position = this.scroll.current;
    this.start = this.relX(e);
    this.startY = e.touches ? e.touches[0].clientY : e.clientY;
    this.canvas.style.cursor = 'grabbing';
    if (this.canvas.setPointerCapture && e.pointerId != null) {
      try {
        this.canvas.setPointerCapture(e.pointerId);
      } catch {
        /* best effort */
      }
    }
  }
  onPointerMove(e: any) {
    if (!this.isDown) return;
    const x = this.relX(e);
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    if (Math.abs(this.start - x) > 4) this.moved = true;
    this.scroll.target = this.scroll.position + distance;
  }
  onPointerUp(e: any) {
    if (!this.isDown) return;
    this.isDown = false;
    this.canvas.style.cursor = 'grab';
    if (this.canvas.releasePointerCapture && e && e.pointerId != null) {
      try {
        this.canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (e.type === 'pointerup' && !this.moved && this.onItemClick) {
      const rect = this.container.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const hit = this.mediaAtPoint(cx, cy);
      if (hit) this.onItemClick(hit.itemIndex);
    }
  }
  mediaAtPoint(cx: number, cy: number) {
    const Wv = this.viewport.width;
    const Hv = this.viewport.height;
    const Ws = this.screen.width;
    const Hs = this.screen.height;
    let best: Media | null = null;
    let bestDx = Infinity;
    for (const m of this.medias ?? []) {
      const sx = (m.plane.position.x / Wv + 0.5) * Ws;
      const sy = (0.5 - m.plane.position.y / Hv) * Hs;
      const hx = (m.plane.scale.x / 2 / Wv) * Ws;
      const hy = (m.plane.scale.y / 2 / Hv) * Hs;
      if (cx >= sx - hx && cx <= sx + hx && cy >= sy - hy && cy <= sy + hy) {
        const dx = Math.abs(cx - sx);
        if (dx < bestDx) {
          bestDx = dx;
          best = m;
        }
      }
    }
    return best;
  }
  onResize() {
    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;
    if (!cw || !ch) return;
    this.screen = { width: cw, height: ch };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) this.medias.forEach((m) => m.onResize({ screen: this.screen, viewport: this.viewport }));
  }
  update() {
    if (!this.isDown && this.autoScroll && !this.reducedMotion) {
      this.scroll.target += this.autoScroll;
    }
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) this.medias.forEach((m) => m.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.boundUpdate);
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(this.container);
    }
    this.canvas.addEventListener('pointerdown', this.boundOnPointerDown);
    this.canvas.addEventListener('pointermove', this.boundOnPointerMove);
    this.canvas.addEventListener('pointerup', this.boundOnPointerUp);
    this.canvas.addEventListener('pointercancel', this.boundOnPointerUp);
    this.canvas.addEventListener('pointerleave', this.boundOnPointerUp);
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundOnPointerDown);
      this.canvas.removeEventListener('pointermove', this.boundOnPointerMove);
      this.canvas.removeEventListener('pointerup', this.boundOnPointerUp);
      this.canvas.removeEventListener('pointercancel', this.boundOnPointerUp);
      this.canvas.removeEventListener('pointerleave', this.boundOnPointerUp);
    }
    if (this.medias) {
      this.medias.forEach((m) => m.destroy());
      this.medias = null;
    }
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
    const loseCtx = this.gl && this.gl.getExtension('WEBGL_lose_context');
    if (loseCtx) loseCtx.loseContext();
  }
}

export default function Gallery({
  items,
  bend = 2.6,
  textColor = '#d4bc9a',
  borderRadius = 0.04,
  font = '500 30px Georgia, "Times New Roman", serif',
  scrollSpeed = 2,
  scrollEase = 0.045,
  autoScroll = 0.018,
  onItemClick,
}: {
  items: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  autoScroll?: number;
  onItemClick?: (i: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    let app: App | undefined;
    let isMounted = true;
    // Best-effort: wait for any web font to settle, then build.
    const start = () => {
      if (!isMounted || !containerRef.current) return;
      app = new App(containerRef.current, {
        items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, autoScroll, onItemClick,
      });
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(start).catch(start);
    } else {
      start();
    }
    return () => {
      isMounted = false;
      if (app) app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, autoScroll, onItemClick]);

  return <div className="h-full w-full touch-pan-y" ref={containerRef} />;
}
