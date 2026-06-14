import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TATTOO_PHOTOS } from '../data.js'

// Smooth, draggable horizontal carousel of healed photographs.
// Scroll-snap for trackpad/touch, arrow buttons for desktop, pointer-drag to fling.
export default function PhotoCarousel({ onOpen }) {
  const trackRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateEdges()
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [updateEdges])

  const scrollByCard = useCallback((dir) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('.carousel-card')
    const step = card ? card.offsetWidth + 18 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step * 1.5, behavior: 'smooth' })
  }, [])

  // Pointer drag-to-scroll (desktop fling)
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const onPointerDown = (e) => {
    const el = trackRef.current
    if (!el || e.pointerType === 'touch') return
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false }
    el.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    const el = trackRef.current
    if (!el || !drag.current.active) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.startScroll - dx
  }
  const onPointerUp = (e) => {
    const el = trackRef.current
    drag.current.active = false
    el?.releasePointerCapture?.(e.pointerId)
  }

  return (
    <div className="carousel" data-reveal>
      <header className="carousel-head">
        <h3 className="carousel-name">From the Chair</h3>
        <p className="carousel-note">Healed photographs — drag or swipe through more pieces.</p>
        <div className="carousel-arrows">
          <button
            className="carousel-arrow"
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
            aria-label="Previous photographs"
          >
            ‹
          </button>
          <button
            className="carousel-arrow"
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
            aria-label="More photographs"
          >
            ›
          </button>
        </div>
      </header>

      <div
        className={`carousel-track ${atStart ? '' : 'is-scrolled'} ${atEnd ? 'is-end' : ''}`}
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {TATTOO_PHOTOS.map((p, i) => (
          <button
            className="carousel-card"
            key={p.src}
            aria-label={`Open ${p.title} in fullscreen`}
            onClick={() => {
              if (drag.current.moved) return // suppress click after a drag
              onOpen(TATTOO_PHOTOS, i)
            }}
          >
            <img src={p.src} alt={p.alt} loading="lazy" decoding="async" draggable="false" />
            <span className="carousel-card-meta">{p.meta}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
