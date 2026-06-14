import React from 'react'
import Glint from './Glint.jsx'
import { LINKS } from '../data.js'

export default function Book() {
  return (
    <section className="section book" id="book">
      <div className="book-inner" data-reveal>
        <p className="book-kicker">
          <Glint size={9} /> Bookings open <Glint size={9} />
        </p>
        <h2 className="book-title">
          Let&apos;s make<br /><em>something yours.</em>
        </h2>
        <p className="book-sub">
          Send your idea, placement, size, and references — custom projects begin with
          a consultation, and flash is claimed first come, first kept.
        </p>
        <div className="book-cta">
          <a className="btn btn--gold" href={LINKS.booking} target="_blank" rel="noreferrer">
            DM @hintertattobooking
          </a>
          <a className="btn" href={LINKS.altars} target="_blank" rel="noreferrer">
            @meetusatthealtars
          </a>
        </div>
        <p className="book-fine">Phoenix, Arizona · private studio · 18+ with valid ID</p>
      </div>
    </section>
  )
}
