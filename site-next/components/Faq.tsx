'use client';

import { useState } from 'react';
import { Plus, Minus } from '@phosphor-icons/react';
import { FAQ } from '@/lib/data';
import SectionHeading from './SectionHeading';

export default function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="shell border-b border-rule py-[var(--section-pad)]">
      <SectionHeading index="05" title="Questions" dek="Everything clients ask before the first line." />

      <div className="mt-10 border-t border-rule">
        {FAQ.map((item, i) => {
          const open = openIdx === i;
          return (
            <div key={i} className="border-b border-rule">
              <h3>
                <button
                  id={`faq-q-${i}`}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-acid active:translate-y-px"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[0.7rem] text-acid">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-mono text-[0.98rem] text-paper">{item.q}</span>
                  </span>
                  <span className="shrink-0 text-acid" aria-hidden="true">
                    {open ? <Minus size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
                  </span>
                </button>
              </h3>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                hidden={!open}
                className="max-w-[70ch] pb-6 pl-9 pr-8 leading-relaxed text-dim"
              >
                {item.a}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
