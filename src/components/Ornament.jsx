import React from 'react'
import Glint from './Glint.jsx'

export default function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <span className="ornament-rule" />
      <Glint size={10} />
      <span className="ornament-rule" />
    </div>
  )
}
