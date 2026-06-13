import React from 'react'
import { LINKS } from '../data.js'

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer-ghost" aria-hidden="true">HINTER MASKEN</p>

      <div className="footer-cols">
        <div className="footer-col">
          <h4>Booking</h4>
          <a href={LINKS.booking} target="_blank" rel="noreferrer">@hintertattobooking</a>
          <a href={LINKS.altars} target="_blank" rel="noreferrer">@meetusatthealtars</a>
        </div>
        <div className="footer-col">
          <h4>Studio</h4>
          <span>Phoenix, Arizona</span>
          <span>Private · by appointment only</span>
        </div>
        <div className="footer-col">
          <h4>Elsewhere</h4>
          <a href={LINKS.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <a href={LINKS.voyagela} target="_blank" rel="noreferrer">VoyageLA interview</a>
        </div>
      </div>

      <div className="footer-bar">
        <span>© {new Date().getFullYear()} HINTER MASKEN</span>
        <span className="footer-bar-mark" aria-hidden="true">✦</span>
        <span>Phoenix Fineline SurRealism</span>
      </div>
    </footer>
  )
}
