'use client';

import { useEffect, useRef } from 'react';
import type { Reel } from '@/lib/data';
import Reveal from './Reveal';

const PLACEMENT = [
  'mx-auto text-center items-center',
  'mr-auto text-left items-start',
  'ml-auto text-right items-end',
];

export default function ReelBreak({ reel, index }: { reel: Reel; index: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!v.src && v.dataset.src) v.src = v.dataset.src;
            if (!reduce) {
              const p = v.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            }
          } else if (!v.paused) {
            v.pause();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const place = PLACEMENT[index % PLACEMENT.length];

  return (
    <section
      aria-label={`Studio reel: ${reel.title}`}
      className="relative flex min-h-[clamp(380px,72svh,640px)] items-center overflow-hidden border-b border-rule"
    >
      <video
        ref={ref}
        data-src={reel.src}
        className="absolute inset-0 -z-10 h-full w-full object-cover grayscale"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-void/72" aria-hidden="true" />
      <div className="shell w-full">
        <Reveal>
          <div className={`flex max-w-[44rem] flex-col ${place}`}>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-acid">
              [ reel {String(index + 1).padStart(2, '0')} ]
            </p>
            <h3 className="mt-4 max-w-[16ch] font-head font-bold uppercase leading-[0.95] tracking-[-0.01em] text-paper text-[clamp(2.2rem,6vw,4.5rem)]">
              {reel.title}
            </h3>
            <p className="mt-4 max-w-[42ch] text-[0.95rem] leading-relaxed text-dim">{reel.body}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
