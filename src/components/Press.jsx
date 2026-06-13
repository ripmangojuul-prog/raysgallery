import React from 'react'
import SectionHeader from './SectionHeader.jsx'
import { PRESS } from '../data.js'

export default function Press() {
  return (
    <section className="section press" id="press">
      <SectionHeader numeral="IV" title="In Print" note="Interviews & collaborations." />
      <ul className="press-list">
        {PRESS.map((p, i) => (
          <li key={p.outlet} data-reveal style={{ transitionDelay: `${i * 60}ms` }}>
            <a className="press-row" href={p.href} target="_blank" rel="noreferrer">
              <span className="press-outlet">{p.outlet}</span>
              <span className="press-piece">{p.piece}</span>
              <span className="press-note">{p.note}</span>
              <span className="press-arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
