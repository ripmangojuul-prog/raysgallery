import React from 'react'
import { LINKS } from '../data.js'

export default function StudioBar() {
  return (
    <section className="studio" aria-label="Studio information">
      <div className="studio-col" data-reveal>
        <h3>The Studio</h3>
        <p>A private room in Phoenix, Arizona. One artist, one client, one piece at a time — the address is shared when your session is confirmed.</p>
      </div>
      <div className="studio-col" data-reveal style={{ transitionDelay: '90ms' }}>
        <h3>Hours</h3>
        <p>By appointment only. No walk-ins. Guest spots and travel dates are announced on Instagram.</p>
      </div>
      <div className="studio-col" data-reveal style={{ transitionDelay: '180ms' }}>
        <h3>Booking</h3>
        <p>
          Text{' '}
          <a href={LINKS.sms}>{LINKS.phone}</a>
          {' '}(text only) with your idea, placement, and size — or claim a piece from the flash archive.
        </p>
      </div>
    </section>
  )
}
