'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';

// A single large wireframe sphere turning slowly behind the content: a quiet
// kinetic armature, not a synthwave grid. Faint dark lines on the concrete page.
// Static under reduced motion.
const VERT = `
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const FRAG = `
  precision highp float;
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 1.0); }
`;

function sphereWire(gl: any, radius: number, lon: number, lat: number) {
  const pos: number[] = [];
  const idx: number[] = [];
  const V = (i: number, j: number) => {
    const theta = (Math.PI * j) / lat; // 0..PI
    const phi = (2 * Math.PI * i) / lon; // 0..2PI
    return [
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi),
    ];
  };
  for (let i = 0; i < lon; i++) {
    for (let j = 0; j <= lat; j++) {
      const [x, y, z] = V(i, j);
      pos.push(x, y, z);
    }
  }
  const id = (i: number, j: number) => (i % lon) * (lat + 1) + j;
  for (let i = 0; i < lon; i++) {
    for (let j = 0; j <= lat; j++) {
      if (j < lat) {
        idx.push(id(i, j), id(i, j + 1)); // meridians
      }
      idx.push(id(i, j), id((i + 1) % lon, j)); // parallels
    }
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(pos) },
    index: { data: new Uint16Array(idx) },
  });
}

export default function WireGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let renderer: any;
    try {
      renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    el.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 32 });
    camera.position.z = 9;
    const scene = new Transform();
    const geometry = sphereWire(gl, 3.1, 40, 22);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: { uColor: { value: [0.13, 0.12, 0.09] } },
    });
    const mesh = new Mesh(gl, { geometry, program, mode: gl.LINES });
    mesh.setParent(scene);
    mesh.rotation.z = 0.35;

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
    };
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    const render = (t: number) => {
      const time = (t - start) / 1000;
      mesh.rotation.y = time * 0.12;
      mesh.rotation.x = Math.sin(time * 0.08) * 0.25;
      renderer.render({ scene, camera });
    };
    if (reduce) {
      render(start + 1000);
    } else {
      const loop = (t: number) => {
        render(t);
        raf = window.requestAnimationFrame(loop);
      };
      raf = window.requestAnimationFrame(loop);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.14] [&>canvas]:h-full [&>canvas]:w-full"
    />
  );
}
