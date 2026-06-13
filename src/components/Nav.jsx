import React, { useEffect, useRef, useState } from 'react'
import { LINKS } from '../data.js'
import Glint from './Glint.jsx'

const NAV_LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#flash', label: 'Flash' },
  { href: '#artist', label: 'Artist' },
  { href: '#press', label: 'Press' },
  { href: '#faq', label: 'FAQ' },
]

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setSolid(y > 24)
      setHidden(y > 480 && y > lastY.current)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    return () => document.documentElement.classList.remove('menu-open')
  }, [open])

  return (
    <>
      <nav className={`nav ${solid ? 'nav--solid' : ''} ${hidden && !open ? 'nav--hidden' : ''}`}>
        <a className="nav-logo" href="#top" onClick={() => setOpen(false)}>
          HINTER<Glint size={8} className="nav-logo-glint" />MASKEN
        </a>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
          <a className="nav-book" href="#book">Book</a>
        </div>
        <button
          className={`nav-burger ${open ? 'is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span />
        </button>
      </nav>

      <div className={`menu ${open ? 'menu--open' : ''}`} aria-hidden={!open}>
        <div className="menu-links">
          {[...NAV_LINKS, { href: '#book', label: 'Book' }].map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              style={{ transitionDelay: open ? `${120 + i * 55}ms` : '0ms' }}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
            >
              <span className="menu-link-numeral">{String(i + 1).padStart(2, '0')}</span>
              {l.label}
            </a>
          ))}
        </div>
        <div className="menu-foot">
          <a href={LINKS.instagram} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>@hintertattoo</a>
          <span>Phoenix, Arizona — by appointment only</span>
        </div>
      </div>
    </>
  )
}
