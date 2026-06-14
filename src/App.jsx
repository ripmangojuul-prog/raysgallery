import React, { useCallback, useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Ticker from './components/Ticker.jsx'
import StudioBar from './components/StudioBar.jsx'
import Work from './components/Work.jsx'
import Flash from './components/Flash.jsx'
import Artist from './components/Artist.jsx'
import Press from './components/Press.jsx'
import Faq from './components/Faq.jsx'
import Book from './components/Book.jsx'
import Create from './components/Create.jsx'
import Footer from './components/Footer.jsx'
import Lightbox from './components/Lightbox.jsx'
import Ornament from './components/Ornament.jsx'

export default function App() {
  const [lightbox, setLightbox] = useState(null) // { items, index }

  const openLightbox = useCallback((items, index) => setLightbox({ items, index }), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])
  const navLightbox = useCallback((dir) => {
    setLightbox((lb) => {
      if (!lb) return lb
      const n = lb.items.length
      return { ...lb, index: (lb.index + dir + n) % n }
    })
  }, [])

  // Scroll-reveal: one shared observer for every [data-reveal] element.
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <a className="skip-link" href="#work">Skip to the work</a>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <StudioBar />
        <Work onOpen={openLightbox} />
        <Ornament />
        <Flash onOpen={openLightbox} />
        <Ornament />
        <Create />
        <Ornament />
        <Artist />
        <Press />
        <Ornament />
        <Faq />
        <Book />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
      {lightbox && (
        <Lightbox
          items={lightbox.items}
          index={lightbox.index}
          onClose={closeLightbox}
          onNav={navLightbox}
        />
      )}
    </>
  )
}
