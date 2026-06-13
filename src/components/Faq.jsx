import React, { useState } from 'react'
import SectionHeader from './SectionHeader.jsx'
import { FAQ } from '../data.js'

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section faq" id="faq">
      <SectionHeader numeral="V" title="Questions" note="Everything clients ask before the first line." />
      <div className="faq-list">
        {FAQ.map((item, i) => {
          const isOpen = open === i
          return (
            <div className={`faq-item ${isOpen ? 'is-open' : ''}`} key={i} data-reveal>
              <button
                className="faq-q"
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <i className="faq-marker" aria-hidden="true">✦</i>
              </button>
              <div className="faq-a" id={`faq-a-${i}`} role="region" aria-hidden={!isOpen}>
                <div className="faq-a-inner">
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
