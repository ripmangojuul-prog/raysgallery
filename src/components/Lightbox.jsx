import React, { useEffect, useRef } from 'react'

export default function Lightbox({ items, index, onClose, onNav }) {
  const item = items[index]
  const closeRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav(1)
      if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('lightbox-open')
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('lightbox-open')
    }
  }, [onClose, onNav])

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button ref={closeRef} className="lightbox-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <button className="lightbox-nav lightbox-nav--prev" onClick={() => onNav(-1)} aria-label="Previous piece">
        ←
      </button>
      <figure className="lightbox-figure" key={item.src}>
        <img src={item.src} alt={item.alt} />
        <figcaption>
          <strong>{item.title}</strong>
          <span>{item.meta}</span>
        </figcaption>
      </figure>
      <button className="lightbox-nav lightbox-nav--next" onClick={() => onNav(1)} aria-label="Next piece">
        →
      </button>
      <span className="lightbox-count" aria-hidden="true">
        {index + 1} / {items.length}
      </span>
    </div>
  )
}
