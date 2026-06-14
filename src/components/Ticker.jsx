import React from 'react'

const ITEMS = [
  'Fineline SurRealism',
  'Black & Grey',
  'By appointment only',
  '@hintertattoo',
  'Custom & available flash',
  'Est. Phoenix, AZ',
]

function Run(props) {
  return (
    <span className="ticker-run" {...props}>
      {ITEMS.map((t, i) => (
        <span className="ticker-item" key={i}>
          {t}<i aria-hidden="true">✦</i>
        </span>
      ))}
    </span>
  )
}

export default function Ticker() {
  return (
    <div className="ticker" aria-label="Fineline SurRealism — by appointment only">
      <div className="ticker-track">
        <Run />
        <Run aria-hidden="true" />
      </div>
    </div>
  )
}
