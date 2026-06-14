import React, { useCallback, useEffect, useRef, useState } from 'react'

// One smooth, draggable carousel for a single curated set of photos.
// Scroll-snap for trackpad/touch, arrow buttons for desktop, pointer-drag to fling.
export default function PhotoCarousel({ numeral, name, note, photos, onOpen }) {
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
        <div className="carousel-head-text">
          {numeral && <span className="carousel-no" aria-hidden="true">{numeral}</span>}
          <h3 className="carousel-name">{name}</h3>
          {note && <p className="carousel-note">{note}</p>}
        </div>
        <div className="carousel-arrows">
          <button
            className="carousel-arrow"
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
            aria-label={`Previous in ${name}`}
          >
            ‹
          </button>
          <button
            className="carousel-arrow"
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
            aria-label={`More in ${name}`}
          >
            ›
          </button>
        </div>
      </header>

      <div
        className="carousel-track"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {photos.map((p, i) => (
          <button
            className="carousel-card"
            key={p.src}
            aria-label={`Open ${p.title} in fullscreen`}
            onClick={() => {
              if (drag.current.moved) return // suppress click after a drag
              onOpen(photos, i)
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
