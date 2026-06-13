import React from 'react'

export default function SectionHeader({ numeral, title, note }) {
  return (
    <header className="section-head" data-reveal>
      <span className="section-numeral" aria-hidden="true">{numeral}.</span>
      <h2 className="section-title">{title}</h2>
      {note && <p className="section-note">{note}</p>}
    </header>
  )
}
