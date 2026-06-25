import { LINKS } from '@/lib/data';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.1em] left-1/2 -translate-x-1/2 select-none font-head font-bold uppercase leading-none text-void-2 text-[clamp(4rem,24vw,19rem)]"
      >
        HINTER
      </span>

      <div className="shell relative py-[clamp(48px,8vh,100px)]">
        <div className="grid gap-8 border-b border-rule pb-10 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <h4 className="mb-1 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-acid">// booking</h4>
            <a href={LINKS.sms} className="text-paper transition-colors hover:text-acid">
              Text {LINKS.phone}
            </a>
            <a href={LINKS.altars} target="_blank" rel="noreferrer" className="text-paper transition-colors hover:text-acid">
              @meetusatthealtars
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="mb-1 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-acid">// studio</h4>
            <span className="text-dim">Phoenix, Arizona</span>
            <span className="text-dim">Private, by appointment only</span>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="mb-1 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-acid">// elsewhere</h4>
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="text-paper transition-colors hover:text-acid">
              Instagram
            </a>
            <a href={LINKS.voyagela} target="_blank" rel="noreferrer" className="text-paper transition-colors hover:text-acid">
              VoyageLA interview
            </a>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">
          <span>© {year} Hinter Tattoo</span>
          <span className="text-acid">//</span>
          <span>Fineline SurRealism</span>
        </div>
      </div>
    </footer>
  );
}
