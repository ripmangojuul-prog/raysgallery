'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WORK_CATEGORIES, PLATES, LINKS } from '@/lib/data';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { useLightbox } from './Lightbox';

const Gallery = dynamic(() => import('./Gallery'), { ssr: false });

export default function Work() {
  const { open } = useLightbox();
  const [activeKey, setActiveKey] = useState(WORK_CATEGORIES[0].key);
  const [showRing, setShowRing] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const galleryItems = useMemo(
    () => PLATES.map((p, i) => ({ image: p.src, text: p.title, index: i })),
    [],
  );
  const openPlate = useCallback((i: number) => open(PLATES, i), [open]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShowRing(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = WORK_CATEGORIES.find((c) => c.key === activeKey) ?? WORK_CATEGORIES[0];

  return (
    <section id="work" className="shell border-b border-rule py-[var(--section-pad)]">
      <SectionHeading
        index="01"
        title="Selected Work"
        dek="Healed pieces, photographed in daylight. Every plate is one of one. Five curated sets to drag through or open full size."
      />

      <Reveal>
        <div
          ref={stageRef}
          className="relative mt-12 h-[clamp(340px,50vh,540px)] w-full select-none border border-rule"
          aria-hidden="true"
        >
          {showRing ? (
            <Gallery items={galleryItems} onItemClick={openPlate} textColor="#bf3326" font='700 24px monospace' />
          ) : null}
        </div>
      </Reveal>

      <div className="mt-14">
        <div className="flex flex-wrap gap-px border border-rule bg-rule" role="group" aria-label="Filter work by set">
          {WORK_CATEGORIES.map((c) => {
            const on = c.key === activeKey;
            return (
              <button
                key={c.key}
                onClick={() => setActiveKey(c.key)}
                aria-pressed={on}
                className={`whitespace-nowrap px-4 py-3 font-mono text-[0.66rem] uppercase tracking-[0.1em] transition-colors active:translate-y-px ${
                  on ? 'bg-paper text-void' : 'bg-void text-dim hover:text-paper'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        <p className="mt-6 max-w-[60ch] text-[0.95rem] text-dim">{active.note}</p>

        <ul className="mt-8 grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-4">
          {active.plates.map((p, i) => (
            <li key={p.src} className="bg-void">
              <button
                onClick={() => open(active.plates, i)}
                aria-label={`Open ${p.title}`}
                className="group relative block w-full overflow-hidden"
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                  width={600}
                  height={800}
                  className="aspect-[3/4] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t border-acid/30 bg-void/80 px-2 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.06em] text-acid opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="truncate">{p.title}</span>
                  <span>[{String(i + 1).padStart(2, '0')}]</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Reveal>
        <p className="mt-14 text-[0.95rem] text-dim">
          The full portfolio lives on{' '}
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noreferrer"
            className="text-paper underline decoration-rule-2 underline-offset-4 transition-colors hover:text-acid hover:decoration-acid"
          >
            @hintertattoo
          </a>
          .
        </p>
      </Reveal>
    </section>
  );
}
