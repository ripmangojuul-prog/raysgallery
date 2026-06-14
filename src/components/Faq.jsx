import React from 'react'
import SectionHeader from './SectionHeader.jsx'
import { FAQ } from '../data.js'

export default function Faq() {
  return (
    <section className="section faq" id="faq">
      <SectionHeader numeral="V" title="Questions" note="Everything clients ask before the first line." />
      <div className="faq-list">
        {FAQ.map((item, i) => (
          <div className="faq-item" key={i} data-reveal>
            <h3 className="faq-q">
              <span>{item.q}</span>
              <i className="faq-marker" aria-hidden="true">✦</i>
            </h3>
            <div className="faq-a">
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
