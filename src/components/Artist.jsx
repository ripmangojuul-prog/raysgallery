import React from 'react'
import SectionHeader from './SectionHeader.jsx'
import { LINKS } from '../data.js'

export default function Artist() {
  return (
    <section className="section artist" id="artist">
      <SectionHeader
        numeral="III"
        title="Behind the Mask"
        note="Ray — the hand inside HINTER TATTOO."
      />
      <div className="artist-grid">
        <figure className="artist-portrait" data-reveal>
          <img
            src="/artist/portrait.jpeg"
            alt="Black and white portrait of Ray, HINTER TATTOO, lit by a single spotlight"
            loading="lazy"
            decoding="async"
          />
          <figcaption>HINTER TATTOO · Phoenix, AZ</figcaption>
        </figure>

        <div className="artist-text">
          <p data-reveal>
            I started with the piano, not the needle. Classical training from the age
            of four — two decades of it — and the same patience a long étude demands is
            exactly what now goes into a single-needle line. I grew up in the Bay Area,
            homeschooled, and art was the quiet room I went to when I needed one. I never
            really left it.
          </p>
          <p data-reveal>
            There was no shortcut and no mentor. I earned my cosmetic-tattoo
            certifications in Southern California, spent years on the floor of a walk-in
            shop in Seattle learning to work fast and clean in front of strangers, and
            eventually built the private studio I keep now in Phoenix. For a long stretch
            that meant carrying a portfolio from door to door until one of them opened —
            and then, slowly, travelling to clients who wanted the work badly enough to
            wait for it.
          </p>
          <p data-reveal>
            My work pulls from old engravings, 1920s illustrated novels, and the
            post-punk records I came up on. What I&apos;m after is a tattoo that reads
            like a fragment of a 17th-century etching that has just begun to melt, weep,
            or dissolve — precise, but a little haunted. I would always rather make one
            strange, quiet thing that is truly yours than something loud that could
            belong to anyone.
          </p>
          <p data-reveal>
            If you want the longer version — how this all started, the travelling years,
            the whole winding story — VoyageLA sat down with me for it.{' '}
            <a href={LINKS.voyagela} target="_blank" rel="noreferrer">
              Read the full interview
            </a>
            .
          </p>

          <dl className="artist-facts" data-reveal>
            <div>
              <dt>Specialty</dt>
              <dd>Fineline SurRealism · black &amp; grey</dd>
            </div>
            <div>
              <dt>Studio</dt>
              <dd>Phoenix, Arizona — private, appointment only</dd>
            </div>
            <div>
              <dt>Seen in</dt>
              <dd>Inked Magazine · Gretsch Guitars · VoyageLA</dd>
            </div>
            <div>
              <dt>Elsewhere</dt>
              <dd>
                <a href={LINKS.instagram} target="_blank" rel="noreferrer">@hintertattoo</a>
                {' · '}
                <a href={LINKS.altars} target="_blank" rel="noreferrer">@meetusatthealtars</a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
