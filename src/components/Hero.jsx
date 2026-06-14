import React from 'react'
import Glint from './Glint.jsx'

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-texture" aria-hidden="true" />
      <div className="hero-spot" aria-hidden="true" />

      <figure className="hero-portrait" aria-hidden="true">
        <img src="/artist/portrait.jpeg" alt="" fetchPriority="high" />
      </figure>

      <p className="hero-corner hero-corner--left">Phoenix, Arizona</p>
      <p className="hero-corner hero-corner--right">By appointment only</p>

      <div className="hero-core">
        <p className="hero-kicker">
          <Glint size={9} /> Fineline SurRealism <Glint size={9} />
        </p>
        <h1 className="hero-title">
          <span className="hero-title-line">Hinter</span>
          <span className="hero-title-line hero-title-line--indent">Tattoo</span>
        </h1>
        <div className="hero-rule" aria-hidden="true">
          <span /><Glint size={11} /><span />
        </div>
        <p className="hero-sub">
          Engravings on skin. Black &amp; grey surrealism in single-needle line —
          classical technique, uneasy dreams.
        </p>
        <div className="hero-cta">
          <a className="btn btn--gold" href="#book">Request an appointment</a>
          <a className="btn" href="#work">View the work</a>
        </div>
      </div>

      <a className="hero-scroll" href="#work" aria-label="Scroll to the work">
        <span className="hero-scroll-label">Scroll</span>
        <span className="hero-scroll-chain" aria-hidden="true"><i /></span>
      </a>

      <Glint size={7} className="hero-glint hero-glint--a" />
      <Glint size={5} className="hero-glint hero-glint--b" />
      <Glint size={9} className="hero-glint hero-glint--c" />
    </header>
  )
}
