import { LINKS } from '@/lib/data';
import Button from './Button';
import Reveal from './Reveal';

export default function Book() {
  return (
    <section
      id="book"
      className="shell flex min-h-[80svh] flex-col justify-center border-b border-rule py-[var(--section-pad)]"
    >
      <Reveal>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-acid">[ 06 ] // bookings open</p>
        <h2 className="mt-6 max-w-[16ch] font-head font-bold uppercase leading-[0.88] tracking-[-0.02em] text-paper text-[clamp(3rem,11vw,9rem)]">
          Let&apos;s make <span className="border-l-[3px] border-acid pl-3">something yours.</span>
        </h2>
        <div className="mt-10 flex flex-col gap-8 border-t border-rule pt-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-dim">
            Text your idea, placement, size, and references. Custom projects begin with a
            consultation, and flash is claimed first come, first kept.
          </p>
          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-wrap gap-3">
              <Button href={LINKS.sms} variant="acid">
                Text {LINKS.phone}
              </Button>
              <Button href={LINKS.altars} variant="ghost" external>
                @meetusatthealtars
              </Button>
            </div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">
              Text only // Phoenix, Arizona // 18+ with valid ID
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
