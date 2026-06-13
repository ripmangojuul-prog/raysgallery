import React from 'react'
import SectionHeader from './SectionHeader.jsx'
import { PLATES, toRoman } from '../data.js'

export default function Work({ onOpen }) {
  return (
    <section className="section work" id="work">
      <SectionHeader
        numeral="I"
        title="Selected Work"
        note="Healed pieces, photographed in daylight — every plate one of one."
      />
      <div className="plates">
        {PLATES.map((p, i) => (
          <article className={`plate ${i % 2 ? 'plate--flip' : ''}`} key={p.src} data-reveal>
            <span className="plate-ghost" aria-hidden="true">{toRoman(i + 1)}</span>
            <figure className="plate-figure">
              <button
                className="plate-frame"
                onClick={() => onOpen(PLATES, i)}
                aria-label={`Open ${p.title} in fullscreen`}
              >
                <img src={p.src} alt={p.alt} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
              </button>
            </figure>
            <aside className="plate-caption">
              <p className="plate-no">Plate {toRoman(i + 1)}</p>
              <h3 className="plate-title">{p.title}</h3>
              <p className="plate-desc">{p.desc}</p>
              <p className="plate-meta">{p.meta}</p>
              <button className="plate-view" onClick={() => onOpen(PLATES, i)}>
                View plate <span aria-hidden="true">+</span>
              </button>
            </aside>
          </article>
        ))}
      </div>
      <p className="work-more" data-reveal>
        The full portfolio lives on{' '}
        <a href="https://www.instagram.com/hintertattoo/" target="_blank" rel="noreferrer">
          @hintertattoo
        </a>{' '}
        — 1,200 pieces and counting.
      </p>
    </section>
  )
}
