import LivePortrait from './LivePortrait';
import Reveal from './Reveal';

// A second classical study, scroll-zoomed, paired with a line of Ray's register.
export default function PortraitBreak() {
  return (
    <section aria-label="Classical study" className="border-b border-rule">
      <div className="shell grid items-center gap-10 py-[var(--section-pad)] md:grid-cols-[1fr_1.1fr] md:gap-14">
        <LivePortrait
          src="/artwork/portrait-2.jpg"
          alt="Black and grey neoclassical painting of a seated woman with folded hands, dissolving into engraving at the base"
          className="aspect-[4/5] border border-rule-2"
        />
        <Reveal>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-acid">// the register</p>
          <p className="mt-6 max-w-[26ch] font-head font-bold leading-[1.12] tracking-[-0.01em] text-paper text-[clamp(1.7rem,4vw,3rem)]">
            A fragment of a seventeenth-century etching, beginning to melt.
          </p>
          <p className="mt-6 max-w-[46ch] text-[0.95rem] leading-relaxed text-dim">
            Precise, but a little haunted. Every piece is drawn for one wearer and tattooed once.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
