import { LINKS } from '@/lib/data';
import Reveal from './Reveal';

export default function StudioBar() {
  return (
    <section aria-label="Studio information" className="border-b border-rule">
      <Reveal>
        <div className="shell grid gap-8 py-[clamp(40px,7vh,88px)] md:grid-cols-[1.5fr_1fr] md:gap-0">
          <div className="md:border-r md:border-rule md:pr-12">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-acid">// the studio</p>
            <p className="mt-5 max-w-[48ch] text-[0.95rem] leading-relaxed text-dim">
              A private room in Phoenix, Arizona. One artist, one client, one piece at a time. The
              address is shared when your session is confirmed.
            </p>
          </div>
          <dl className="grid gap-6 md:pl-12">
            <div>
              <dt className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-faint">Hours</dt>
              <dd className="mt-2 max-w-[36ch] text-dim">
                By appointment only. No walk-ins. Guest spots and travel dates are announced on
                Instagram.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-faint">Booking</dt>
              <dd className="mt-2 max-w-[36ch] text-dim">
                Text{' '}
                <a href={LINKS.sms} className="text-paper transition-colors hover:text-acid">
                  {LINKS.phone}
                </a>{' '}
                (text only) with your idea, placement, and size, or claim a piece from the flash
                archive.
              </dd>
            </div>
          </dl>
        </div>
      </Reveal>
    </section>
  );
}
