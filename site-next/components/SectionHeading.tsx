import type { ReactNode } from 'react';
import Reveal from './Reveal';

// Brutalist section header: an indexed meta row with a rule running across, then
// a big monospace uppercase headline, then an optional dek. The index is part of
// the deliberate broadsheet / zine system, not decoration.
export default function SectionHeading({
  index,
  title,
  dek,
}: {
  index?: string;
  title: ReactNode;
  dek?: ReactNode;
}) {
  return (
    <Reveal>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[0.72rem] tracking-[0.1em] text-acid">
          [ {index ?? '//'} ]
        </span>
        <span className="h-px flex-1 bg-rule-2" aria-hidden="true" />
      </div>
      <h2 className="mt-7 max-w-[18ch] font-head font-bold uppercase leading-[0.92] tracking-[-0.01em] text-paper text-[clamp(2.2rem,7vw,5rem)]">
        {title}
      </h2>
      {dek ? (
        <p className="mt-6 max-w-[60ch] text-[0.95rem] leading-relaxed text-dim">{dek}</p>
      ) : null}
    </Reveal>
  );
}
