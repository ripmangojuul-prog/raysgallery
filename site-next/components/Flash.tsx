'use client';

import { useState } from 'react';
import { FLASH } from '@/lib/data';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import Button from './Button';
import { useLightbox } from './Lightbox';

const INITIAL = 12;

export default function Flash() {
  const { open } = useLightbox();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? FLASH : FLASH.slice(0, INITIAL);

  return (
    <section id="flash" className="shell border-b border-rule py-[var(--section-pad)]">
      <SectionHeading
        index="02"
        title="The Flash Archive"
        dek="Pre-drawn sheets, ready for skin. Each design is tattooed once, then retired. To claim one, note the sheet and text (480) 420-4319 (text only). First come, first kept."
      />

      <ul className="mt-12 grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((f, i) => (
          <li key={f.src} className="bg-void">
            <button
              onClick={() => open(FLASH, i)}
              aria-label={`Open flash sheet ${i + 1}`}
              className="group relative block w-full overflow-hidden"
            >
              <img
                src={f.src}
                alt={f.alt}
                loading="lazy"
                decoding="async"
                width={600}
                height={800}
                className="aspect-[3/4] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
              />
              <span className="absolute left-2 top-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-acid opacity-0 transition-opacity group-hover:opacity-100">
                [ {String(i + 1).padStart(2, '0')} ]
              </span>
            </button>
          </li>
        ))}
      </ul>

      {!expanded ? (
        <Reveal>
          <div className="mt-10">
            <Button onClick={() => setExpanded(true)} variant="ghost">
              Unfold full archive [ {FLASH.length} ]
            </Button>
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}
