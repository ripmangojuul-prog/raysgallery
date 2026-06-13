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
            Before the needle there was the piano — classical training from the age of
            four, two decades of it, the same patience that now sits behind every
            single-needle line. Born in the Bay Area and homeschooled, she grew up
            treating art as a refuge, and never stopped.
          </p>
          <p data-reveal>
            The career was built alone: cosmetic-tattoo certifications in Southern
            California, years on the floor of a Seattle walk-in shop, and finally a
            private studio in Phoenix. No mentor, no shortcut — a portfolio carried
            from door to door until one opened.
          </p>
          <p data-reveal>
            The work itself draws from old engravings and 1920s illustrated novels,
            post-punk records, and the conviction that a tattoo should feel like a fragment of
            a 17th-century etching that has begun to melt, weep, or dissolve.
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
