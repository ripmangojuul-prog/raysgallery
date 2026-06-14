import React from 'react'
import SectionHeader from './SectionHeader.jsx'
import { WORK_CATEGORIES, toRoman } from '../data.js'

export default function Work({ onOpen }) {
  return (
    <section className="section work" id="work">
      <SectionHeader
        numeral="I"
        title="Selected Work"
        note="Healed pieces, photographed in daylight — every plate one of one. Grouped by the three styles I work in."
      />

      {WORK_CATEGORIES.map((cat, c) => (
        <div className="work-cat" key={cat.key} data-reveal>
          <header className="work-cat-head">
            <span className="work-cat-no" aria-hidden="true">{toRoman(c + 1)}</span>
            <h3 className="work-cat-name">{cat.name}</h3>
            {cat.note && <p className="work-cat-note">{cat.note}</p>}
          </header>

          <div className="plates">
            {cat.plates.map((p, i) => (
              <article className={`plate ${i % 2 ? 'plate--flip' : ''}`} key={p.src} data-reveal>
                <span className="plate-ghost" aria-hidden="true">{toRoman(i + 1)}</span>
                <figure className="plate-figure">
                  <button
                    className="plate-frame"
                    onClick={() => onOpen(cat.plates, i)}
                    aria-label={`Open ${p.title} in fullscreen`}
                  >
                    <img src={p.src} alt={p.alt} loading={c === 0 && i === 0 ? 'eager' : 'lazy'} decoding="async" />
                  </button>
                </figure>
                <aside className="plate-caption">
                  <p className="plate-no">Plate {toRoman(i + 1)}</p>
                  <h4 className="plate-title">{p.title}</h4>
                  <p className="plate-desc">{p.desc}</p>
                  <p className="plate-meta">{p.meta}</p>
                  <button className="plate-view" onClick={() => onOpen(cat.plates, i)}>
                    View plate <span aria-hidden="true">+</span>
                  </button>
                </aside>
              </article>
            ))}
          </div>
        </div>
      ))}

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
