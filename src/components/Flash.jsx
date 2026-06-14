import React, { useState } from 'react'
import SectionHeader from './SectionHeader.jsx'
import { FLASH, LINKS, toRoman } from '../data.js'

const INITIAL = 9

export default function Flash({ onOpen }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? FLASH : FLASH.slice(0, INITIAL)

  return (
    <section className="section flash" id="flash">
      <SectionHeader
        numeral="II"
        title="The Flash Archive"
        note="Pre-drawn sheets, ready for skin. Each design is tattooed once, then retired."
      />
      <p className="flash-intro" data-reveal>
        Claiming a piece is simple — note the sheet number and send it to{' '}
        <a href={LINKS.booking} target="_blank" rel="noreferrer">@hintertattobooking</a>.
        First come, first kept.
      </p>
      <div className="flash-grid">
        {visible.map((f, i) => {
          // Items revealed by "unfold" cascade in continuous order from where
          // the visible set left off; the initial sheets just drop in on load.
          const step = expanded && i >= INITIAL ? i - INITIAL : i
          return (
            <button
              className="flash-item"
              key={f.src}
              style={{ animationDelay: `${(step % 12) * 45}ms` }}
              onClick={() => onOpen(FLASH, i)}
              aria-label={`Open flash sheet ${i + 1} in fullscreen`}
            >
              <img src={f.src} alt={f.alt} loading="lazy" decoding="async" />
              <span className="flash-item-tag" aria-hidden="true">
                <em>№ {toRoman(i + 1)}</em>
                <span>Available</span>
              </span>
            </button>
          )
        })}
      </div>
      {!expanded && (
        <div className="flash-unfold" data-reveal>
          <button className="btn" onClick={() => setExpanded(true)}>
            Unfold the full archive — {FLASH.length} sheets
          </button>
        </div>
      )}
    </section>
  )
}
