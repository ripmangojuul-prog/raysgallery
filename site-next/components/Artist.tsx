import { LINKS } from '@/lib/data';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Artist() {
  return (
    <section id="artist" className="shell border-b border-rule py-[var(--section-pad)]">
      <SectionHeading index="04" title="Behind the Mask" dek="Ray, the hand inside HINTER TATTOO." />

      <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <Reveal>
          <figure className="relative border border-rule-2">
            <img
              src="/artist/portrait.jpeg"
              alt="Black and white portrait of Ray, HINTER TATTOO, lit by a single spotlight"
              loading="lazy"
              decoding="async"
              width={1000}
              height={1250}
              className="aspect-[4/5] w-full object-cover grayscale"
            />
            {/* the one green moment: a sage duotone over the portrait */}
            <div className="pointer-events-none absolute inset-0 bg-leaf/35 mix-blend-multiply" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 bg-leaf/15 mix-blend-screen" aria-hidden="true" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-leaf/50 bg-void/80 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-leaf">
              <span>// ray</span>
              <span>PHX</span>
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="max-w-[62ch] space-y-6 text-[0.95rem] leading-relaxed text-dim">
            <p>
              I started with the piano, not the needle. Classical training from the age of four, two
              decades of it, and the same patience a long étude demands is exactly what now goes into
              a single-needle line. I grew up in the Bay Area, homeschooled, and art was the quiet
              room I went to when I needed one. I never really left it.
            </p>
            <p>
              There was no shortcut and no mentor. I earned my cosmetic-tattoo certifications in
              Southern California, spent years on the floor of a walk-in shop in Seattle learning to
              work fast and clean in front of strangers, and eventually built the private studio I
              keep now in Phoenix. For a long stretch that meant carrying a portfolio from door to
              door until one of them opened, and then, slowly, travelling to clients who wanted the
              work badly enough to wait for it.
            </p>
            <p>
              My work pulls from old engravings, 1920s illustrated novels, and the post-punk records
              I came up on. What I&apos;m after is a tattoo that reads like a fragment of a
              17th-century etching that has just begun to melt, weep, or dissolve. Precise, but a
              little haunted. I would always rather make one strange, quiet thing that is truly yours
              than something loud that could belong to anyone.
            </p>
            <p>
              If you want the longer version, how this all started, the travelling years, the whole
              winding story, VoyageLA sat down with me for it.{' '}
              <a
                href={LINKS.voyagela}
                target="_blank"
                rel="noreferrer"
                className="text-paper underline decoration-rule-2 underline-offset-4 transition-colors hover:text-acid hover:decoration-acid"
              >
                Read the full interview
              </a>
              .
            </p>

            <dl className="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-rule pt-8">
              {[
                ['Specialty', 'Fineline SurRealism, black & grey'],
                ['Studio', 'Phoenix, Arizona. Private, appointment only.'],
                ['Seen in', 'Inked Magazine, Gretsch Guitars, VoyageLA'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-faint">{k}</dt>
                  <dd className="mt-1.5 text-dim">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-faint">Elsewhere</dt>
                <dd className="mt-1.5 text-dim">
                  <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="transition-colors hover:text-acid">
                    @hintertattoo
                  </a>
                  {', '}
                  <a href={LINKS.altars} target="_blank" rel="noreferrer" className="transition-colors hover:text-acid">
                    @meetusatthealtars
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
