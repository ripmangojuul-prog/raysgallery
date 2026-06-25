'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

// Hero video, kept but quiet: grayscale, framed by the panel border, with a
// light concrete scrim so it sits inside the paper. Poster-first (the poster is
// the LCP and the reduced-motion still); preload="metadata".
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const v = ref.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [reduce]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-void-2">
      <img src="/video/hero-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover grayscale" />
      {!reduce && (
        <video
          ref={ref}
          className={`absolute inset-0 h-full w-full object-cover grayscale transition-opacity duration-700 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
          src="/video/hero-loop.mp4"
          poster="/video/hero-poster.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
        />
      )}
      <div className="absolute inset-0 bg-void/10 mix-blend-multiply" />
    </div>
  );
}
